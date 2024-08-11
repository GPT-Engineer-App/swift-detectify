import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HistoryPage = () => {
  // Mock data for the chart
  const data = [
    { date: '2023-01-01', glass: 4, can: 3, pet1: 2, hdpe2: 1, carton: 2 },
    { date: '2023-01-02', glass: 3, can: 4, pet1: 3, hdpe2: 2, carton: 1 },
    { date: '2023-01-03', glass: 5, can: 2, pet1: 4, hdpe2: 3, carton: 3 },
    { date: '2023-01-04', glass: 2, can: 5, pet1: 1, hdpe2: 4, carton: 2 },
    { date: '2023-01-05', glass: 6, can: 3, pet1: 5, hdpe2: 2, carton: 4 },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Historical Data</h1>
      <Card>
        <CardHeader>
          <CardTitle>Object Counts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart width={600} height={300} data={data} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="glass" stroke="#8884d8" />
            <Line type="monotone" dataKey="can" stroke="#82ca9d" />
            <Line type="monotone" dataKey="pet1" stroke="#ffc658" />
            <Line type="monotone" dataKey="hdpe2" stroke="#ff7300" />
            <Line type="monotone" dataKey="carton" stroke="#00C49F" />
          </LineChart>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
