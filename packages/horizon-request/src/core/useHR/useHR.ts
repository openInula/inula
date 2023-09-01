import Horizon from '@cloudsop/horizon';
import HRClient from './HRClient';
import { HrRequestConfig, QueryOptions } from '../../types/interfaces';

// 全局初始化一个 HRClient 实例
const hrClient = new HRClient();

const useHR = <T = unknown>(url: string, config?: HrRequestConfig, options?: QueryOptions): { data?: T; error?: any } => {
  const [data, setData] = Horizon.useState<T>(null as unknown as T);
  const [error, setError] = Horizon.useState<any>(null);

  function handleRequest(result: any) {
    return (event: any) => {
      result = event.detail;
      setData(result);
    };
  }

  Horizon.useEffect(() => {
    const fetchData = async () => {
      try {
        let result = await hrClient.query(url, config, options);
        document.addEventListener('request', handleRequest(result));

        setData(result); // 未设置轮询查询时展示一次
      } catch (err) {
        setError(err);
      }
    };

    fetchData().catch(() => {}); // catch作用是消除提示

    // 清除缓存
    return () => {
      hrClient.invalidateCache(url);
      document.removeEventListener('request', handleRequest);
    };
  }, [url, config]);

  return { data, error };
};

export default useHR;
