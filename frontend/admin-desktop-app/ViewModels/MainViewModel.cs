using System;
using System.Threading.Tasks;
using System.Windows.Input;
using LaundryAdminApp.Models;
using LaundryAdminApp.Services;

namespace LaundryAdminApp.ViewModels
{
    public class MainViewModel : BaseViewModel
    {
        public DashboardViewModel DashboardVM { get; } = new();
        public OrdersViewModel OrdersVM { get; } = new();
        public ServicesViewModel ServicesVM { get; } = new();
        public CustomersViewModel CustomersVM { get; } = new();
        public PaymentsViewModel PaymentsVM { get; } = new();
        public ReportsViewModel ReportsVM { get; } = new();

        private object? _currentView;
        public object? CurrentView
        {
            get => _currentView;
            set => Set(ref _currentView, value);
        }

        private string _activeSection = "Dashboard";
        public string ActiveSection
        {
            get => _activeSection;
            set => Set(ref _activeSection, value);
        }

        public AdminUser? CurrentAdmin => ApiService.Instance.CurrentAdmin;

        public string AdminDisplayName => !string.IsNullOrEmpty(CurrentAdmin?.FullName)
            ? CurrentAdmin.FullName
            : "Super Admin";

        public string AdminEmail => !string.IsNullOrEmpty(CurrentAdmin?.Email)
            ? CurrentAdmin.Email
            : "admin@laundryapp.com";

        public ICommand NavigateCommand { get; }
        public ICommand LogoutCommand { get; }

        public event Action? OnLogoutRequested;

        public MainViewModel()
        {
            NavigateCommand = new RelayCommand(param =>
            {
                if (param is string sec) NavigateTo(sec);
            });

            LogoutCommand = new RelayCommand(() =>
            {
                ApiService.Instance.Logout();
                OnLogoutRequested?.Invoke();
            });

            ApiService.Instance.OnAuthChanged += () =>
            {
                OnPropertyChanged(nameof(CurrentAdmin));
                OnPropertyChanged(nameof(AdminDisplayName));
                OnPropertyChanged(nameof(AdminEmail));
            };

            NavigateTo("Dashboard");
        }

        public void NavigateTo(string section)
        {
            ActiveSection = section;
            CurrentView = section switch
            {
                "Dashboard" => DashboardVM,
                "Orders"    => OrdersVM,
                "Services"  => ServicesVM,
                "Customers" => CustomersVM,
                "Payments"  => PaymentsVM,
                "Reports"   => ReportsVM,
                _           => DashboardVM
            };

            // Trigger data fetch for chosen view
            _ = Task.Run(async () =>
            {
                switch (section)
                {
                    case "Dashboard": await DashboardVM.LoadAsync(); break;
                    case "Orders":    await OrdersVM.LoadAsync(); break;
                    case "Services":  await ServicesVM.LoadAsync(); break;
                    case "Customers": await CustomersVM.LoadAsync(); break;
                    case "Payments":  await PaymentsVM.LoadAsync(); break;
                    case "Reports":   await ReportsVM.LoadAsync(); break;
                }
            });
        }
    }
}
