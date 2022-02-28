function captureAssertion(fn) {
  try {
    fn();
  } catch (error) {
    return {
      pass: false,
      message: () => error.message,
    };
  }
  return {pass: true};
}

function toHaveYielded(Scheduler, expectedYields) {
  return captureAssertion(() => {
    const actualYields = Scheduler.unstable_clearYields();
    expect(actualYields).toEqual(expectedYields);
  });
}

module.exports = {
  toHaveYielded,
};
