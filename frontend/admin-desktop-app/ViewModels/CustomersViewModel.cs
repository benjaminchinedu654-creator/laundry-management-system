using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using LaundryAdminApp.Models;
using LaundryAdminApp.Services;

namespace LaundryAdminApp.ViewModels
{
    public class CustomersViewModel : BaseViewModel
    {
        private ObservableCollection<Customer> _customers = new();
        public ObservableCollection<Customer> Customers
        {
            get => _customers;
            set => Set(ref _customers, value);
        }

        private Customer? _selectedCustomer;
        public Customer? SelectedCustomer
        {
            get => _selectedCustomer;
            set => Set(ref _selectedCustomer, value);
        }

        private string _searchText = "";
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (Set(ref _searchText, value))
                    _ = LoadAsync();
            }
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
        public ICommand ToggleStatusCommand { get; }

        public CustomersViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadAsync());
            ToggleStatusCommand = new RelayCommand(async (param) =>
            {
                if (param is Customer c) await ToggleStatusAsync(c);
                else if (SelectedCustomer != null) await ToggleStatusAsync(SelectedCustomer);
            });
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            StatusMessage = "Loading customer accounts...";
            try
            {
                var res = await ApiService.Instance.GetCustomersAsync(SearchText);
                if (res.Success && res.Data?.Users != null)
                {
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        Customers.Clear();
                        foreach (var cust in res.Data.Users) Customers.Add(cust);
                    });
                    StatusMessage = $"Loaded {Customers.Count} customers ({DateTime.Now:T})";
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

        private async Task ToggleStatusAsync(Customer customer)
        {
            int nextStatus = customer.IsActive == 1 ? 0 : 1;
            StatusMessage = $"Updating status for {customer.FullName}...";

            var res = await ApiService.Instance.UpdateCustomerStatusAsync(customer.Id, nextStatus);
            if (res.Success)
            {
                customer.IsActive = nextStatus;
                await LoadAsync();
                StatusMessage = $"Customer {customer.FullName} is now {(nextStatus == 1 ? "Active" : "Suspended")}.";
            }
            else
            {
                StatusMessage = $"Action failed: {res.Message}";
            }
        }
    }
}
