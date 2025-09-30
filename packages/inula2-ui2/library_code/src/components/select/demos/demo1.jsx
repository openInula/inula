import Select from "../index.jsx";

function Demo1() {
    let value = '';
    const options = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
        { label: 'Option C', value: 'c' },
        { label: 'Option D', value: 'd' },
    ];

    function handleChange(val) {
        value = val
    }

    return <Select style={{ width: 200 }} options={options} onChange={handleChange} placeholder="Select an option" />
}

export default Demo1; 