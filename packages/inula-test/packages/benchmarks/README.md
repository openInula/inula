# Horizon Benchmarking

## Commands
```bash
# will compare local repo vs remote merge base repo
yarn start

# will compare local repo vs remote merge base repo
# this can significantly improve bench times due to no build
yarn start --skip-build

# will only build and run local repo against benchmarks (no remote values will be shown)
yarn start --local

# will only build and run remote merge base repo against benchmarks (no local values will be shown)
yarn start --remote

# will only build and run remote main repo against benchmarks
yarn start --remote=main

# same as "yarn start"
yarn start --remote --local

# runs benchmarks with Chrome in headless mode
yarn start --headless

# runs only specific string matching benchmarks
yarn start --benchmark=hacker
```
