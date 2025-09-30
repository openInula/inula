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
      <for each={departments}>
        {(dept, i) => (
          <div>
            <h3>{dept.name}</h3>
            <ul>
              <for each={dept.teams}>
                {(team, j) => <li>{team}</li>}
              </for>
            </ul>
          </div>
        )}
      </for>
    </div>
  );
}


