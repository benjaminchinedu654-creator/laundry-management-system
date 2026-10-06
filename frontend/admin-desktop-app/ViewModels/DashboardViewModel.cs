using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using LaundryAdminApp.Models;
using LaundryAdminApp.Services;

namespace LaundryAdminApp.ViewModels
{
    public class DashboardViewModel : BaseViewModel
    {
        private DashboardMetrics _metrics = new();
        public DashboardMetrics Metrics
        {
            get => _metrics;
            set => Set(ref _metrics, value);
        }

        private ObservableCollection<Order> _recentOrders = new();
        public ObservableCollection<Order> RecentOrders
        {
            get => _recentOrders;
            set => Set(ref _recentOrders, value);
        }

        private ObservableCollection<StatusCountItem> _statusCounts = new();
        public ObservableCollection<StatusCountItem> StatusCounts
        {
            get => _statusCounts;
            set => Set(ref _statusCounts, value);
        }

        private bool _isLoading;
        public bool IsLoading
        {
            get => _isLoading;
            set => Set(ref _isLoading, value);
        }

        private string _statusMessage = "";
        public string StatusMessage
        {
            get => _statusMessage;
            set => Set(ref _statusMessage, value);
        }

        public ICommand RefreshCommand { get; }

        public DashboardViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadAsync());
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            StatusMessage = "Refreshing live dashboard metrics...";
            try
            {
                var res = await ApiService.Instance.GetDashboardAsync();
                if (res.Success && res.Data != null)
                {
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        Metrics = res.Data.Metrics ?? new DashboardMetrics();
                        RecentOrders.Clear();
                        if (res.Data.RecentOrders != null)
                        {
                            foreach (var ord in res.Data.RecentOrders) RecentOrders.Add(ord);
                        }

                        StatusCounts.Clear();
                        if (res.Data.ByStatus != null)
                        {
                            foreach (var item in res.Data.ByStatus) StatusCounts.Add(item);
                        }
                    });
                    StatusMessage = $"Updated at {DateTime.Now:T}";
                }
                else
                {
                    StatusMessage = res.Message;
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Load error: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}
