const timers = new Map();

function stop(name = 'default') {
  if (!timers.get(name)) {
    throw Error(`timer '${name}' does not exist.`);
  }
  return Date.now() - timers.get(name);
}

export default {
  start: (name = 'default') => {
    if (timers.get(name)) {
      throw Error(`timer '${name}' already exists.`);
    }
    timers.set(name, Date.now());
    return name;
  },
  stop,
  log: (name = 'default') => {
    console.log(`Stopwatch[${name}]:${stop(name)}`);
  },
};
