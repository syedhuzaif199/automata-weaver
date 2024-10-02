function clamp(min, max, value) {
  return Math.min(Math.max(value, min), max);
}

function lettersFromRange(range) {
  const letters = [];
  if (range[0] == "[" && range[2] == "-" && range[4] == "]") {
    for (let j = range[1].charCodeAt(0); j <= range[3].charCodeAt(0); j++) {
      letters.push(String.fromCharCode(j));
    }
    return letters;
  } else return null;
}

export { clamp, lettersFromRange };
