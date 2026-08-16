globalThis.window = globalThis;
await import("../data.js");

const { questions, characters, dimensions } = globalThis.TEST_DATA;
const keys = Object.keys(dimensions);
const calibration = Object.fromEntries(keys.map((key) => {
  const aggregate = questions.reduce((acc, question) => {
    const values = question.options.map((option) => option.weights[key] || 0);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    acc.mean += mean;
    acc.variance += values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
    return acc;
  }, { mean: 0, variance: 0 });
  return [key, { mean: aggregate.mean, std: Math.sqrt(aggregate.variance) || 1 }];
}));

function scoreAnswers(answers) {
  const raw = Object.fromEntries(keys.map((key) => [key, 0]));
  answers.forEach((answer, index) => keys.forEach((key) => { raw[key] += questions[index].options[answer].weights[key] || 0; }));
  return Object.fromEntries(keys.map((key) => {
    const score = 50 + ((raw[key] - calibration[key].mean) / calibration[key].std) * 15;
    return [key, Math.round(Math.max(5, Math.min(95, score)))];
  }));
}

const targets = Object.fromEntries(Object.entries(characters).map(([id, character]) => {
  const profileMean = keys.reduce((sum, key) => sum + character.profile[key], 0) / keys.length;
  const answers = questions.map((question) => {
    const values = question.options.map((option) => keys.reduce((sum, key) => sum + (option.weights[key] || 0) * ((character.profile[key] - profileMean) / 25), 0));
    return values.indexOf(Math.max(...values));
  });
  return [id, scoreAnswers(answers)];
}));

const affinityModels = Object.fromEntries(Object.entries(characters).map(([id, character]) => {
  const values = keys.map((key) => character.profile[key]);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const std = Math.sqrt(values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length) || 1;
  const vector = Object.fromEntries(keys.map((key) => [key, (character.profile[key] - mean) / std]));
  const optionScores = questions.map((question) => question.options.map((option) => keys.reduce((sum, key) => sum + (option.weights[key] || 0) * vector[key], 0)));
  const stats = optionScores.reduce((acc, choices) => {
    const choiceMean = choices.reduce((sum, value) => sum + value, 0) / choices.length;
    acc.mean += choiceMean;
    acc.variance += choices.reduce((sum, value) => sum + ((value - choiceMean) ** 2), 0) / choices.length;
    return acc;
  }, { mean: 0, variance: 0 });
  return [id, { optionScores, mean: stats.mean, std: Math.sqrt(stats.variance) || 1 }];
}));

function match(answers) {
  const scores = scoreAnswers(answers);
  return Object.entries(characters).map(([id, character]) => ({
    id,
    distance: Math.sqrt(keys.reduce((sum, key) => sum + ((scores[key] - targets[id][key]) ** 2), 0) / keys.length)
  })).sort((a, b) => a.distance - b.distance)[0].id;
}

function matchAffinity(answers) {
  return Object.entries(affinityModels).map(([id, model]) => {
    const raw = answers.reduce((sum, answer, index) => sum + model.optionScores[index][answer], 0);
    return { id, score: (raw - model.mean) / model.std };
  }).sort((a, b) => b.score - a.score)[0].id;
}

const samples = Number(process.argv[2] || 100000);
const counts = Object.fromEntries(Object.keys(characters).map((key) => [key, 0]));
const affinityCounts = Object.fromEntries(Object.keys(characters).map((key) => [key, 0]));
for (let i = 0; i < samples; i += 1) {
  const answers = questions.map(() => Math.floor(Math.random() * 4));
  counts[match(answers)] += 1;
  affinityCounts[matchAffinity(answers)] += 1;
}

console.log("原型距离法");
console.table(Object.entries(counts).map(([role, count]) => ({ role, count, percent: `${(count / samples * 100).toFixed(2)}%` })));
console.log("标准化亲和度法");
console.table(Object.entries(affinityCounts).map(([role, count]) => ({ role, count, percent: `${(count / samples * 100).toFixed(2)}%` })));
