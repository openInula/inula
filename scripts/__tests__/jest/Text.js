import * as Horizon from '@cloudsop/horizon/index.ts';
import * as LogUtils from '../jest/logUtils';

const Text = (props) => {
    LogUtils.log(props.text);
    return <p>{props.text}</p>;
};

export default Text;
