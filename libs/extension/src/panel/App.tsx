import { useState, useEffect } from 'horizon';
import VTree, { IData } from '../components/VTree';
import Search from '../components/Search';
import ComponentInfo from '../components/ComponentInfo';
import styles from './App.less';
import Select from '../svgs/Select';
import { mockParsedVNodeData, parsedMockState } from '../devtools/mock';

function App() {
  const [parsedVNodeData, setParsedVNodeData] = useState([]);
  const [componentInfo, setComponentInfo] = useState({ name: null, attrs: {} });
  const [filterValue, setFilterValue] = useState('');
  useEffect(() => {
    if (isDev) {
      setParsedVNodeData(mockParsedVNodeData);
      setComponentInfo({
        name: 'Demo',
        attrs: {
          state: parsedMockState,
          props: parsedMockState,
        },
      });
    }
  }, []);
  const idIndentationMap: {
    [id: string]: number;
  } = {};
  const data: IData[] = [];
  let i = 0;
  while (i < parsedVNodeData.length) {
    const id = parsedVNodeData[i] as string;
    i++;
    const name = parsedVNodeData[i] as string;
    i++;
    const parentId = parsedVNodeData[i] as string;
    i++;
    const userKey = parsedVNodeData[i] as string;
    i++;
    const indentation = parentId === '' ? 0 : idIndentationMap[parentId] + 1;
    idIndentationMap[id] = indentation;
    const item = {
      id, name, indentation, userKey
    };
    data.push(item);
  }

  const handleSearchChange = (str: string) => {
    setFilterValue(str);
  };

  return (
    <div className={styles.app}>
      <div className={styles.left}>
        <div className={styles.left_top} >
          <div className={styles.select} >
            <Select />
          </div>
          <div className={styles.divider} />
          <div className={styles.search}>
            <Search onChange={handleSearchChange} />
          </div>
        </div>
        <div className={styles.left_bottom}>
          <VTree data={data} highlightValue={filterValue} />
        </div>
      </div>
      <div className={styles.right}>
        <ComponentInfo name={componentInfo.name} attrs={componentInfo.attrs} />
      </div>
    </div>
  );
}

export default App;
