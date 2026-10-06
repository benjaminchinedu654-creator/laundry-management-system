using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using LaundryAdminApp.Models;
using LaundryAdminApp.Services;

namespace LaundryAdminApp.ViewModels
{
    public class ReportsViewModel : BaseViewModel
    {
        private string _totalRevenueFormatted = "\u20a60";
        public string TotalRevenueFormatted
        {
            get => _totalRevenueFormatted;
            set => Set(ref _totalRevenueFormatted, value);
        }

        private ObservableCollection<RevenueDayItem> _dailyRevenue = new();
        public ObservableCollection<RevenueDayItem> DailyRevenue
        {
            get => _dailyRevenue;
            set => Set(ref _dailyRevenue, value);
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

        public ReportsViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadAsync());
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            StatusMessage = "Fetching revenue and operations report...";
            try
            {
                var res = await ApiService.Instance.GetRevenueReportAsync();
                if (res.Success && res.Data != null)
                {
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        TotalRevenueFormatted = $"\u20a6{res.Data.TotalRevenue:N0}";
                        DailyRevenue.Clear();
                        if (res.Data.ByDay != null)
                        {
                            foreach (var item in res.Data.ByDay) DailyRevenue.Add(item);
                        }
                    });
                    StatusMessage = $"Report updated ({DateTime.Now:T})";
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
