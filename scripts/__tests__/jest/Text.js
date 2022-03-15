import * as React from '../../../libs/horizon/src/external/Horizon';
import * as LogUtils from '../jest/logUtils';

const Text = (props) => {
    LogUtils.log(props.text);
    return <p>{props.text}</p>;
};

export default Text;
