function NestedList() {
  const departments = [
    {
      name: '技术部',
      teams: ['前端组', '后端组', '测试组']
    },
    {
      name: '产品部',
      teams: ['设计组', '运营组']
    }
  ];
  
  return (
    <div>
      {departments.map((dept, i) => (
        <div key={i}>
          <h3>{dept.name}</h3>
          <ul>
            {dept.teams.map((team, j) => (
              <li key={j}>{team}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}


