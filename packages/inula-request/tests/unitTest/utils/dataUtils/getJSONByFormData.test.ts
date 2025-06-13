import getJSONByFormData from '../../../../src/utils/dataUtils/getJSONByFormData';

describe('getJSONByFormData function', () => {
  it('should convert FormData to JSON object', () => {
    const formData = new FormData();
    formData.append('name', 'John');
    formData.append('age', '30');
    
    const result = getJSONByFormData(formData);
    
    expect(result).toEqual({
      name: 'John',
      age: '30',
    });
  });
  
  it('should return null if FormData or entries() is not available', () => {
    const invalidFormData = {} as FormData;
    const result = getJSONByFormData(invalidFormData);
    
    expect(result).toBeNull();
  });
  
  it('should handle empty FormData', () => {
    const emptyFormData = new FormData();
    
    const result = getJSONByFormData(emptyFormData);
    
    expect(result).toEqual({});
  });
});