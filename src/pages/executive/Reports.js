import { Card, Table } from 'react-bootstrap';

function Reports() {
  return (
    <Card className="shadow-sm p-4">
      <h4>Reports</h4>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Report Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Monthly Attendance</td>
            <td>Completed</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Performance Summary</td>
            <td>Pending</td>
          </tr>
        </tbody>
      </Table>
    </Card>
  );
}

export default Reports;
