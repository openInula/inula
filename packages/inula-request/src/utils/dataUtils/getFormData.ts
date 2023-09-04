function getFormData(obj: Record<string, any>, formData: FormData = new FormData()): FormData {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (Array.isArray(value)) {
        for (const item of value) {
          formData.append(key, item.toString());
        }
      } else {
        formData.append(key, value.toString());
      }
    }
  }

  return formData;
}

export default getFormData;
