'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FiUsers,
  FiFileText,
  FiBriefcase,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiCreditCard,
  FiActivity,
} from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import styles from './page.module.css';

export default function DashboardPage() {
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [stats, setStats] = useState({
    totalClients: 0,
    totalInvoices: 0,
    totalProjects: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    activeProjects: 0,
    overdueInvoices: 0,
    monthlyRevenue: 0,
  });
  
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [invoiceStatusData, setInvoiceStatusData] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
     
      const [clientsRes, invoicesRes, projectsRes] = await Promise.all([
        fetch(`${baseUrl}/api/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/invoices`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/projects`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const clients = clientsRes.ok ? await clientsRes.json() : [];
      const invoices = invoicesRes.ok ? await invoicesRes.json() : [];
      const projects = projectsRes.ok ? await projectsRes.json() : [];


      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_ttc || 0), 0);
      const pendingInvoices = invoices.filter(inv => 
        !['payé', 'payée', 'paid'].includes(inv.payment_status?.toLowerCase())
      ).length;
      
      const overdueInvoices = invoices.filter(inv => {
        if (!inv.due_date || ['payé', 'payée', 'paid'].includes(inv.payment_status?.toLowerCase())) 
          return false;
        return new Date(inv.due_date) < new Date();
      }).length;

      const activeProjects = projects.filter(proj => 
        proj.statut?.toLowerCase() === 'en cours'
      ).length;

    
      const monthlyRevenue = calculateMonthlyRevenue(invoices);

      const recentInvoicesData = invoices
        .sort((a, b) => new Date(b.created_at || b.issue_date) - new Date(a.created_at || a.issue_date))
        .slice(0, 5);

      const recentProjectsData = projects
        .sort((a, b) => new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date))
        .slice(0, 5);

    
      const invoiceStatusChart = calculateInvoiceStatusData(invoices);
      const projectStatusChart = calculateProjectStatusData(projects);

      setStats({
        totalClients: clients.length,
        totalInvoices: invoices.length,
        totalProjects: projects.length,
        totalRevenue,
        pendingInvoices,
        activeProjects,
        overdueInvoices,
        monthlyRevenue: monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0,
      });

      setRecentInvoices(recentInvoicesData);
      setRecentProjects(recentProjectsData);
      setInvoiceStatusData(invoiceStatusChart);
      setProjectStatusData(projectStatusChart);
      setMonthlyRevenueData(monthlyRevenue);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (invoices) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      
      const monthInvoices = invoices.filter(inv => {
        const invoiceDate = new Date(inv.issue_date || inv.created_at);
        return `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}` === monthKey;
      });
      
      const revenue = monthInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_ttc || 0), 0);
      
      months.push({
        month: monthName,
        revenue: revenue
      });
    }
    return months;
  };

  const calculateInvoiceStatusData = (invoices) => {
    const statusCount = {
      'payé': 0,
      'impayé': 0,
      'en attente': 0,
      'partiel': 0,
    };

    invoices.forEach(inv => {
      const status = inv.payment_status?.toLowerCase() || 'en attente';
      if (status in statusCount) {
        statusCount[status]++;
      } else {
        statusCount['en attente']++;
      }
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: invoices.length > 0 ? (count / invoices.length) * 100 : 0
    }));
  };

  const calculateProjectStatusData = (projects) => {
    const statusCount = {
      'à faire': 0,
      'en cours': 0,
      'achevé': 0,
      'annulé': 0,
      'bloqué': 0,
    };

    projects.forEach(proj => {
      const status = proj.statut?.toLowerCase() || 'à faire';
      if (status in statusCount) {
        statusCount[status]++;
      } else {
        statusCount['à faire']++;
      }
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: projects.length > 0 ? (count / projects.length) * 100 : 0
    }));
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: color }}>
        <Icon />
      </div>
      <div className={styles.statContent}>
        <h3>{title}</h3>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statSubtitle}>{subtitle}</div>
        {trend && <div className={styles.trend} style={{ color: trend > 0 ? '#10b981' : '#ef4444' }}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>}
      </div>
    </div>
  );

  const StatusBar = ({ label, value, percentage, color }) => (
    <div className={styles.statusItem}>
      <div className={styles.statusHeader}>
        <span className={styles.statusLabel}>{label}</span>
        <span className={styles.statusValue}>{value}</span>
      </div>
      <div className={styles.statusBar}>
        <div 
          className={styles.statusProgress} 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  );

  const RevenueChart = () => (
    <div className={styles.revenueChart}>
      <h3>Revenus Mensuels</h3>
      <div className={styles.chartBars}>
        {monthlyRevenueData.map((month, index) => (
          <div key={index} className={styles.chartBarContainer}>
            <div className={styles.chartBar}>
              <div 
                className={styles.chartFill}
                style={{ 
                  height: `${Math.max(10, (month.revenue / Math.max(...monthlyRevenueData.map(m => m.revenue || 1))) * 80)}%` 
                }}
              ></div>
            </div>
            <span className={styles.chartLabel}>{month.month}</span>
            <span className={styles.chartValue}>{month.revenue.toFixed(0)} TND</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <AuthLayout user={user}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout user={user}>
      <div className={styles.container}>
        
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h1>Bonjour, {user?.full_name || user?.company_name || 'Utilisateur'} 👋</h1>
            <p>Voici un aperçu de votre activité</p>
          </div>
          <div className={styles.date}>
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </header>

  
        <div className={styles.statsGrid}>
          <StatCard
            icon={FiUsers}
            title="Clients"
            value={stats.totalClients}
            subtitle="Clients actifs"
            color="#3b82f6"
          />
          <StatCard
            icon={FiFileText}
            title="Factures"
            value={stats.totalInvoices}
            subtitle={`${stats.pendingInvoices} en attente`}
            color="#8b5cf6"
          />
          <StatCard
            icon={FiBriefcase}
            title="Projets"
            value={stats.totalProjects}
            subtitle={`${stats.activeProjects} en cours`}
            color="#f59e0b"
          />
          <StatCard
            icon={FiDollarSign}
            title="Revenus"
            value={`${stats.totalRevenue.toFixed(3)} TND`}
            subtitle="Chiffre d'affaires total"
            color="#10b981"
          />
        </div>

        <div className={styles.mainContent}>
         
          <div className={styles.leftColumn}>
         
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Évolution des Revenus</h3>
                <FiTrendingUp className={styles.cardIcon} />
              </div>
              <RevenueChart />
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Factures Récentes</h3>
                <FiFileText className={styles.cardIcon} />
              </div>
              <div className={styles.activityList}>
                {recentInvoices.length > 0 ? recentInvoices.map((invoice, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <FiFileText />
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>
                        {invoice.ref_facture || `Facture #${invoice.id}`}
                      </div>
                      <div className={styles.activitySubtitle}>
                        {invoice.client_name} • {parseFloat(invoice.total_ttc || 0).toFixed(3)} TND
                      </div>
                    </div>
                    <div className={`${styles.activityStatus} ${styles[invoice.payment_status?.toLowerCase()] || styles.pending}`}>
                      {invoice.payment_status || 'En attente'}
                    </div>
                  </div>
                )) : (
                  <div className={styles.emptyState}>
                    Aucune facture récente
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
      
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Statut des Factures</h3>
                <FiActivity className={styles.cardIcon} />
              </div>
              <div className={styles.statusList}>
                {invoiceStatusData.map((item, index) => (
                  <StatusBar
                    key={index}
                    label={item.status}
                    value={item.count}
                    percentage={item.percentage}
                    color={
                      item.status.toLowerCase() === 'payé' ? '#10b981' :
                      item.status.toLowerCase() === 'impayé' ? '#ef4444' :
                      item.status.toLowerCase() === 'partiel' ? '#f59e0b' : '#6b7280'
                    }
                  />
                ))}
              </div>
            </div>

     
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Statut des Projets</h3>
                <FiBriefcase className={styles.cardIcon} />
              </div>
              <div className={styles.statusList}>
                {projectStatusData.map((item, index) => (
                  <StatusBar
                    key={index}
                    label={item.status}
                    value={item.count}
                    percentage={item.percentage}
                    color={
                      item.status.toLowerCase() === 'achevé' ? '#10b981' :
                      item.status.toLowerCase() === 'en cours' ? '#3b82f6' :
                      item.status.toLowerCase() === 'à faire' ? '#f59e0b' :
                      item.status.toLowerCase() === 'annulé' ? '#ef4444' : '#6b7280'
                    }
                  />
                ))}
              </div>
            </div>


            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Projets Récents</h3>
                <FiCalendar className={styles.cardIcon} />
              </div>
              <div className={styles.activityList}>
                {recentProjects.length > 0 ? recentProjects.map((project, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <FiBriefcase />
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>
                        {project.name}
                      </div>
                      <div className={styles.activitySubtitle}>
                        {project.final_amount || '0'} TND • {project.start_date?.slice(0, 10) || 'Non définie'}
                      </div>
                    </div>
                    <div className={`${styles.activityStatus} ${styles[project.statut?.toLowerCase()] || styles.pending}`}>
                      {project.statut || 'À faire'}
                    </div>
                  </div>
                )) : (
                  <div className={styles.emptyState}>
                    Aucun projet récent
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

    
        <div className={styles.quickStats}>
          <div className={styles.quickStat}>
            <FiCreditCard className={styles.quickStatIcon} />
            <div>
              <div className={styles.quickStatValue}>{stats.overdueInvoices}</div>
              <div className={styles.quickStatLabel}>Factures en retard</div>
            </div>
          </div>
          <div className={styles.quickStat}>
            <FiTrendingUp className={styles.quickStatIcon} />
            <div>
              <div className={styles.quickStatValue}>{stats.monthlyRevenue.toFixed(3)} TND</div>
              <div className={styles.quickStatLabel}>Revenu ce mois</div>
            </div>
          </div>
          <div className={styles.quickStat}>
            <FiUsers className={styles.quickStatIcon} />
            <div>
              <div className={styles.quickStatValue}>{stats.activeProjects}</div>
              <div className={styles.quickStatLabel}>Projets actifs</div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}