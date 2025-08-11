// src/components/BillingChart.jsx
import React from 'react';
import '../assets/css/BillingChart.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function BillingChart({ data, onBarClick }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="month" />
        <YAxis tickFormatter={value => `$${value.toFixed(2)}`} />
        <Tooltip formatter={value => `$${value.toLocaleString()}`} />
        <Legend />
        <Bar
          dataKey="clients"
          name="Clientes"
          className="clients-bar"
          cursor="pointer"
          onClick={(d) => onBarClick(d.month, 'clients')}
        />
        <Bar
          dataKey="providers"
          name="Proveedores"
          className="providers-bar"
          cursor="pointer"
          onClick={(d) => onBarClick(d.month, 'providers')}
        />
        <Bar
          dataKey="commissions"
          name="Comisiones"
          className="commissions-bar"
          cursor="pointer"
          onClick={(d) => onBarClick(d.month, 'commissions')}
        />
        <Bar
          dataKey="profitAfterComm"
          name="Utilidad"
          className="bar-profit"
          cursor="pointer"
          onClick={d => onBarClick(d.month, 'profitAfterComm')}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
