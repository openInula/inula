import '../index.css';
import Input from '../../input';
import Button from '../../button';
import { Form, FormItem, setValueByPath } from '../index';
import Select from '../../select';

const Demo3 = () => {
    let layout = 'inline';
    let searchForm = {
        keyword: '',
        category: ''
    };

    const categoryOptions = [
        { label: '全部', value: 'all' },
        { label: '技术', value: 'tech' },
        { label: '设计', value: 'design' },
        { label: '产品', value: 'product' }
    ];

    const handleSearch = (values) => {
        console.log('搜索条件：', values);
    };

    const handleReset = () => {
        searchForm.keyword = '';
        searchForm.category = '';
    };

    return (
        <div style={{ paddingTop: 24, textAlign: 'left' }}>
            <Form
                model={searchForm}
                layout={layout}
                labelAlign="left"
                onFinish={handleSearch}
                style={{ marginBottom: 16, maxWidth: layout === 'inline' ? 'none' : 600 }}
            >
                <FormItem label="Form Layout" name="layout" style={{display: 'flex'}}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Button type={layout === 'horizontal' ? 'primary' : 'default'} onClick={() => { layout = 'horizontal'; }}>horizontal</Button>
                        <Button type={layout === 'vertical' ? 'primary' : 'default'} onClick={() => { layout = 'vertical'; }}>vertical</Button>
                        <Button type={layout === 'inline' ? 'primary' : 'default'} onClick={() => { layout = 'inline'; }}>inline</Button>
                    </div>
                </FormItem>
                <FormItem name="keyword" label="Field A" model={searchForm}>
                    <Input
                        placeholder="input placeholder"
                        onInput={(e) => setValueByPath(searchForm, 'keyword', e.target.value)}
                    />
                </FormItem>

                <FormItem name="category" label="Field B" model={searchForm}>
                    <Select
                        placeholder="input placeholder"
                        options={categoryOptions}
                        onChange={(value) => setValueByPath(searchForm, 'category', value)}
                    />
                </FormItem>

                <FormItem name="actions" label={null} model={searchForm}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button type="primary" htmlType="submit">Search</Button>
                        {/* <Button onClick={handleReset}>Reset</Button> */}
                    </div>
                </FormItem>
            </Form>
        </div>
    );
};

export default Demo3;
