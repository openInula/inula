const BasicGenerator = require('../../BasicGenerator');

class Generator extends BasicGenerator {
  prompting() {
    return this.prompt([
      {
        type: 'list',
        name: 'bundlerType',
        message: 'Please select the build type',
        choices: ['webpack', 'vite'],
      },
    ]).then(props => {
      this.prompts = props;
      console.log('finish prompting');
    });
  }
  writing() {
    const src = this.templatePath(this.prompts.bundlerType);
    const dest = this.destinationPath();
    this.writeFiles(src, dest, {
      context: {
        ...this.prompts,
      },
    });
  }
}

module.exports = Generator;
