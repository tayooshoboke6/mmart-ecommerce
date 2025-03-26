import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatNaira } from '../../utils/formatters';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  Filler
);

// Mock data for fallback when API fails
const mockDashboardData = {
  total_sales: "1,250,000.00",
  total_orders: 156,
  pending_orders: 23,
  orders_by_status: [
    { status: 'pending', count: 23 },
    { status: 'processing', count: 42 },
    { status: 'shipped', count: 31 },
    { status: 'delivered', count: 48 },
    { status: 'cancelled', count: 12 }
  ],
  recent_orders: [
    {
      id: 1,
      order_number: 'ORD-2025-001',
      customer_name: 'John Adewale',
      total: 35000,
      status: 'pending',
      payment_status: 'paid',
      created_at: '2025-03-24T14:30:00'
    },
    {
      id: 2,
      order_number: 'ORD-2025-002',
      customer_name: 'Amina Ibrahim',
      total: 12500,
      status: 'processing',
      payment_status: 'paid',
      created_at: '2025-03-24T12:15:00'
    },
    {
      id: 3,
      order_number: 'ORD-2025-003',
      customer_name: 'Chidi Okonkwo',
      total: 78900,
      status: 'delivered',
      payment_status: 'paid',
      created_at: '2025-03-23T18:45:00'
    },
    {
      id: 4,
      order_number: 'ORD-2025-004',
      customer_name: 'Funke Akindele',
      total: 24600,
      status: 'shipped',
      payment_status: 'paid',
      created_at: '2025-03-23T09:20:00'
    },
    {
      id: 5,
      order_number: 'ORD-2025-005',
      customer_name: 'Tunde Bakare',
      total: 9800,
      status: 'cancelled',
      payment_status: 'refunded',
      created_at: '2025-03-22T16:10:00'
    }
  ],
  total_customers: 230,
  new_customers: 18,
  date_range: {
    start_date: '2025-02-23',
    end_date: '2025-03-25'
  },
  low_stock_count: 10,
  out_of_stock_count: 5,
  about_to_expire_count: 8,
  expired_count: 3
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [useMockData, setUseMockData] = useState(false);
  const [showSalesAmount, setShowSalesAmount] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [peakDaysData, setPeakDaysData] = useState(null);
  const [peakHoursData, setPeakHoursData] = useState(null);
  const [peakMetrics, setPeakMetrics] = useState(null);
  const [segmentAnalysis, setSegmentAnalysis] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.status === 'success') {
          setStats(response.data.data);
          setUseMockData(false);
        } else {
          throw new Error(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        // Use mock data as fallback
        setStats(mockDashboardData);
        setUseMockData(true);
        console.log('Using mock data as fallback');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        let startDate;
        const now = new Date();

        switch (dateRange) {
          case '24hours':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default: // 90days
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/dashboard/revenue?start_date=${startDate.toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.status === 'success') {
          setRevenueData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        if (useMockData) {
          setRevenueData(generateMockRevenueData(
            dateRange === '7days' ? 7 : 
            dateRange === '30days' ? 30 : 
            dateRange === '24hours' ? 1 : 90
          ));
        }
      }
    };

    fetchRevenueData();
  }, [dateRange, useMockData]);

  useEffect(() => {
    const fetchPeakData = async () => {
      try {
        let startDate;
        const now = new Date();

        switch (dateRange) {
          case '24hours':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default: // 90days
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        }

        // Fetch peak days data
        const daysResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/dashboard/peak-days?start_date=${startDate.toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (daysResponse.data.status === 'success') {
          setPeakDaysData(daysResponse.data.data);
          setPeakMetrics(prevMetrics => ({
            ...prevMetrics,
            days: daysResponse.data.metrics
          }));
        }

        // Fetch peak hours data
        const hoursResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/dashboard/peak-hours?start_date=${startDate.toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (hoursResponse.data.status === 'success') {
          setPeakHoursData(hoursResponse.data.data);
          setSegmentAnalysis(hoursResponse.data.segments);
          setPeakMetrics(prevMetrics => ({
            ...prevMetrics,
            hours: hoursResponse.data.metrics
          }));
        }
      } catch (err) {
        console.error('Error fetching peak data:', err);
      }
    };

    fetchPeakData();
  }, [dateRange]);

  const generateMockRevenueData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        revenue: Math.floor(Math.random() * 100000) + 50000 // Random revenue between 50k and 150k
      });
    }
    return data;
  };

  // Prepare chart data for orders by status
  const prepareOrdersByStatusChart = () => {
    if (!stats || !stats.orders_by_status) return null;

    const statusColors = {
      'pending': '#FFA500',
      'processing': '#3B82F6',
      'shipped': '#10B981',
      'delivered': '#059669',
      'cancelled': '#EF4444',
      'refunded': '#8B5CF6'
    };

    const labels = stats.orders_by_status.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1));
    const data = stats.orders_by_status.map(item => item.count);
    const backgroundColor = stats.orders_by_status.map(item => statusColors[item.status] || '#CBD5E1');

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 0,
        }
      ]
    };
  };

  // Prepare revenue chart data
  const prepareRevenueChartData = () => {
    if (!revenueData) return null;

    const labels = revenueData.map(item => format(new Date(item.date), 'MMM dd'));
    const revenues = revenueData.map(item => item.revenue);
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;

    return {
      labels,
      datasets: [
        {
          label: 'Daily Revenue',
          data: revenues,
          fill: true,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: '#3B82F6'
        }
      ]
    };
  };

  // Prepare peak days chart data
  const preparePeakDaysChart = () => {
    if (!peakDaysData) return null;

    return {
      labels: peakDaysData.map(item => item.day),
      datasets: [
        {
          label: 'Orders',
          data: peakDaysData.map(item => item.order_count),
          backgroundColor: peakDaysData.map(item => 
            item.is_peak_orders ? '#3B82F6' :
            item.is_low_orders ? '#EF4444' : '#93C5FD'
          ),
          borderRadius: 4
        },
        {
          label: 'Revenue',
          data: peakDaysData.map(item => item.revenue),
          backgroundColor: peakDaysData.map(item => 
            item.is_peak_revenue ? '#10B981' :
            item.is_low_revenue ? '#F87171' : '#6EE7B7'
          ),
          borderRadius: 4,
          yAxisID: 'revenue'
        }
      ]
    };
  };

  // Prepare peak hours chart data
  const preparePeakHoursChart = () => {
    if (!peakHoursData) return null;

    return {
      labels: peakHoursData.map(item => item.hour_formatted),
      datasets: [
        {
          label: 'Orders',
          data: peakHoursData.map(item => item.order_count),
          backgroundColor: peakHoursData.map(item => 
            item.is_peak_orders ? '#8B5CF6' :
            item.is_low_orders ? '#EF4444' : '#C4B5FD'
          ),
          borderRadius: 4
        },
        {
          label: 'Revenue',
          data: peakHoursData.map(item => item.revenue),
          backgroundColor: peakHoursData.map(item => 
            item.is_peak_revenue ? '#F59E0B' :
            item.is_low_revenue ? '#F87171' : '#FCD34D'
          ),
          borderRadius: 4,
          yAxisID: 'revenue'
        }
      ]
    };
  };

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Revenue: ${formatNaira(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatNaira(value)
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const peakDaysOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Peak Days Analysis'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Number of Orders'
        }
      },
      revenue: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue'
        },
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          callback: (value) => formatNaira(value)
        }
      }
    }
  };

  const peakHoursOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Peak Hours Analysis'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Number of Orders'
        }
      },
      revenue: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue'
        },
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          callback: (value) => formatNaira(value)
        }
      }
    }
  };

  const ordersByStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render error state with mock data
  if (error && !useMockData) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      
      {useMockData && (
        <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Displaying mock data. API connection failed.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Date Range Selector */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setDateRange('24hours')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              dateRange === '24hours'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setDateRange('7days')}
            className={`px-4 py-2 text-sm font-medium ${
              dateRange === '7days'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30days')}
            className={`px-4 py-2 text-sm font-medium ${
              dateRange === '30days'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('90days')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              dateRange === '90days'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            90 Days
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Sales Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M7 21H2v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M7 21H2v-1a6 6 0 0112 0v1z" />
              </svg>
            </div>
            <div className="flex-grow">
              <p className="text-gray-500 text-sm">Total Sales</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-800">
                  {showSalesAmount ? formatNaira(stats?.total_sales || 0) : '•••••••'}
                </p>
                <button 
                  onClick={() => setShowSalesAmount(!showSalesAmount)}
                  className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showSalesAmount ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.515a4 4 0 00-5.478-5.478z" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 000.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Orders Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H5z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_orders || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Pending Orders Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.pending_orders || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Total Customers Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_customers || 0}</p>
              <p className="text-xs text-green-500">+{stats?.new_customers || 0} new</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Revenue Chart and Peak Hours Analysis in same row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Revenue Trends</h2>
          </div>
          <div className="h-[400px] w-full">
            {prepareRevenueChartData() && (
              <Line 
                data={prepareRevenueChartData()} 
                options={revenueChartOptions}
              />
            )}
          </div>
        </div>

        {/* Peak & Low Hours Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Peak & Low Hours Analysis</h2>
            
            {/* Peak Hours Metrics */}
            {peakMetrics?.hours && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600">Peak Orders Hour</div>
                  <div className="font-semibold">{peakMetrics.hours.peak_orders_hour}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">Low Orders Hour</div>
                  <div className="font-semibold">{peakMetrics.hours.low_orders_hour}</div>
                </div>
              </div>
            )}

            {/* Time Segments Analysis */}
            {segmentAnalysis && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(segmentAnalysis).map(([segment, data]) => (
                  <div key={segment} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 capitalize">{segment}</div>
                    <div className="font-semibold text-sm">
                      Orders: {data.total_orders}
                      <br />
                      Revenue: {formatNaira(data.total_revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="h-[300px] w-full">
              {preparePeakHoursChart() && (
                <Bar 
                  data={preparePeakHoursChart()} 
                  options={peakHoursOptions}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Peak Days Analysis and Orders by Status in same row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Peak Days Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Peak & Low Days Analysis</h2>
            
            {/* Peak Metrics */}
            {peakMetrics?.days && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">Peak Orders Day</div>
                  <div className="font-semibold">{peakMetrics.days.peak_orders_day}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">Low Orders Day</div>
                  <div className="font-semibold">{peakMetrics.days.low_orders_day}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Peak Revenue Day</div>
                  <div className="font-semibold">{peakMetrics.days.peak_revenue_day}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">Low Revenue Day</div>
                  <div className="font-semibold">{peakMetrics.days.low_revenue_day}</div>
                </div>
              </div>
            )}
            
            <div className="h-[300px] w-full">
              {preparePeakDaysChart() && (
                <Bar 
                  data={preparePeakDaysChart()} 
                  options={peakDaysOptions}
                />
              )}
            </div>
          </div>
        </div>

        {/* Orders by Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders by Status</h2>
          <div className="h-[300px] w-full">
            {prepareOrdersByStatusChart() && (
              <Doughnut 
                data={prepareOrdersByStatusChart()} 
                options={ordersByStatusOptions}
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders and Product Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders - Reduced width */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary hover:underline text-sm">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recent_orders?.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <Link to={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {formatNaira(order.total)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Status Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Status</h2>
          
          {/* Low Stock */}
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-yellow-800">Low Stock</h3>
              <Link to="/admin/products?filter=low_stock" className="text-xs text-yellow-600 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats?.low_stock_count || 0}</p>
            <p className="text-xs text-yellow-600">Products with stock level below 10</p>
          </div>

          {/* Out of Stock */}
          <div className="mb-4 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-800">Out of Stock</h3>
              <Link to="/admin/products?filter=out_of_stock" className="text-xs text-red-600 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats?.out_of_stock_count || 0}</p>
            <p className="text-xs text-red-600">Products with zero stock</p>
          </div>

          {/* About to Expire */}
          <div className="mb-4 p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-orange-800">About to Expire</h3>
              <Link to="/admin/products?filter=about_to_expire" className="text-xs text-orange-600 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats?.about_to_expire_count || 0}</p>
            <p className="text-xs text-orange-600">Products expiring within 30 days</p>
          </div>

          {/* Expired */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-800">Expired</h3>
              <Link to="/admin/products?filter=expired" className="text-xs text-gray-600 hover:underline">
                View All
              </Link>
            </div>
            <p className="text-2xl font-bold text-gray-600">{stats?.expired_count || 0}</p>
            <p className="text-xs text-gray-600">Products past expiration date</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/products/create" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </Link>
          
          <Link to="/admin/orders" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 0h.01M15 19l-3-3m0 0l-3 3m3-3V8m0 0l-3 3m-3-3h.01" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Manage Orders</span>
          </Link>
          
          <Link to="/admin/categories" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Categories</span>
          </Link>
          
          <Link to="/admin/users" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Customers</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
