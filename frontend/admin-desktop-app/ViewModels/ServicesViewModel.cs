using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using LaundryAdminApp.Models;
using LaundryAdminApp.Services;

namespace LaundryAdminApp.ViewModels
{
    public class ServicesViewModel : BaseViewModel
    {
        public List<string> CategoryFilters { get; } = new()
        {
            "All Categories", "Wash & Iron", "Dry Clean", "Iron Only", "Specialty"
        };

        public List<string> FormCategories { get; } = new()
        {
            "Wash & Iron", "Dry Clean", "Iron Only", "Specialty"
        };

        private string _selectedCategory = "All Categories";
        public string SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (Set(ref _selectedCategory, value))
                    ApplyFilter();
            }
        }

        private List<ServiceItem> _allServices = new();

        private ObservableCollection<ServiceItem> _filteredServices = new();
        public ObservableCollection<ServiceItem> FilteredServices
        {
            get => _filteredServices;
            set => Set(ref _filteredServices, value);
        }

        private ServiceItem? _selectedService;
        public ServiceItem? SelectedService
        {
            get => _selectedService;
            set
            {
                if (Set(ref _selectedService, value) && value != null)
                {
                    FormId = value.Id;
                    FormName = value.Name;
                    FormCategory = value.Category;
                    FormPrice = value.UnitPrice.ToString("F2");
                    FormDescription = value.Description ?? "";
                    FormIsAvailable = value.IsAvailable == 1;
                    IsEditMode = true;
                }
            }
        }

        // Form Fields
        private int _formId;
        public int FormId { get => _formId; set => Set(ref _formId, value); }

        private string _formName = "";
        public string FormName { get => _formName; set => Set(ref _formName, value); }

        private string _formCategory = "Wash & Iron";
        public string FormCategory { get => _formCategory; set => Set(ref _formCategory, value); }

        private string _formPrice = "500.00";
        public string FormPrice { get => _formPrice; set => Set(ref _formPrice, value); }

        private string _formDescription = "";
        public string FormDescription { get => _formDescription; set => Set(ref _formDescription, value); }

        private bool _formIsAvailable = true;
        public bool FormIsAvailable { get => _formIsAvailable; set => Set(ref _formIsAvailable, value); }

        private bool _isEditMode;
        public bool IsEditMode { get => _isEditMode; set => Set(ref _isEditMode, value); }

        private bool _isLoading;
        public bool IsLoading { get => _isLoading; set => Set(ref _isLoading, value); }

        private string _statusMessage = "";
        public string StatusMessage { get => _statusMessage; set => Set(ref _statusMessage, value); }

        public ICommand RefreshCommand { get; }
        public ICommand SaveCommand { get; }
        public ICommand ResetFormCommand { get; }
        public ICommand ToggleAvailabilityCommand { get; }
        public ICommand DeleteCommand { get; }

        public ServicesViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadAsync());
            SaveCommand = new RelayCommand(async () => await SaveServiceAsync());
            ResetFormCommand = new RelayCommand(ResetForm);
            ToggleAvailabilityCommand = new RelayCommand(async (param) =>
            {
                if (param is ServiceItem item) await ToggleAvailabilityAsync(item);
                else if (SelectedService != null) await ToggleAvailabilityAsync(SelectedService);
            });
            DeleteCommand = new RelayCommand(async () => await DeleteSelectedServiceAsync());
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            StatusMessage = "Loading laundry services catalog...";
            try
            {
                var res = await ApiService.Instance.GetServicesAsync();
                if (res.Success && res.Data?.Services != null)
                {
                    _allServices = res.Data.Services;
                    Application.Current.Dispatcher.Invoke(ApplyFilter);
                    StatusMessage = $"Loaded {_allServices.Count} services ({DateTime.Now:T})";
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

        private void ApplyFilter()
        {
            FilteredServices.Clear();
            var items = _allServices.AsEnumerable();
            if (SelectedCategory != "All Categories")
            {
                items = items.Where(s => string.Equals(s.Category, SelectedCategory, StringComparison.OrdinalIgnoreCase));
            }
            foreach (var item in items)
            {
                FilteredServices.Add(item);
            }
        }

        public void ResetForm()
        {
            FormId = 0;
            FormName = "";
            FormCategory = "Wash & Iron";
            FormPrice = "500.00";
            FormDescription = "";
            FormIsAvailable = true;
            IsEditMode = false;
            SelectedService = null;
            StatusMessage = "Form cleared.";
        }

        private async Task SaveServiceAsync()
        {
            if (string.IsNullOrWhiteSpace(FormName))
            {
                StatusMessage = "Service name is required.";
                return;
            }

            if (!decimal.TryParse(FormPrice, out var price) || price < 0)
            {
                StatusMessage = "Valid unit price is required.";
                return;
            }

            IsLoading = true;
            try
            {
                if (IsEditMode && FormId > 0)
                {
                    StatusMessage = $"Updating service '{FormName}'...";
                    var res = await ApiService.Instance.UpdateServiceAsync(
                        FormId, FormName.Trim(), FormCategory.Trim(), price, FormDescription, FormIsAvailable ? 1 : 0);
                    if (res.Success)
                    {
                        StatusMessage = $"Service '{FormName}' updated successfully!";
                        await LoadAsync();
                        ResetForm();
                    }
                    else
                    {
                        StatusMessage = $"Update failed: {res.Message}";
                    }
                }
                else
                {
                    StatusMessage = $"Creating service '{FormName}'...";
                    var res = await ApiService.Instance.CreateServiceAsync(
                        FormName.Trim(), FormCategory.Trim(), price, FormDescription, FormIsAvailable ? 1 : 0);
                    if (res.Success)
                    {
                        StatusMessage = $"Service '{FormName}' added successfully!";
                        await LoadAsync();
                        ResetForm();
                    }
                    else
                    {
                        StatusMessage = $"Creation failed: {res.Message}";
                    }
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Save error: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ToggleAvailabilityAsync(ServiceItem item)
        {
            int newStatus = item.IsAvailable == 1 ? 0 : 1;
            StatusMessage = $"Toggling availability for '{item.Name}'...";

            var res = await ApiService.Instance.UpdateServiceAvailabilityAsync(item.Id, newStatus);
            if (res.Success)
            {
                item.IsAvailable = newStatus;
                await LoadAsync();
                StatusMessage = $"'{item.Name}' is now {(newStatus == 1 ? "Active" : "Disabled")}.";
            }
            else
            {
                StatusMessage = $"Action failed: {res.Message}";
            }
        }

        private async Task DeleteSelectedServiceAsync()
        {
            if (SelectedService == null) return;

            var confirm = MessageBox.Show(
                $"Are you sure you want to delete service '{SelectedService.Name}' ({SelectedService.Category})?",
                "Confirm Deletion",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning);

            if (confirm != MessageBoxResult.Yes) return;

            StatusMessage = $"Deleting service '{SelectedService.Name}'...";
            var res = await ApiService.Instance.DeleteServiceAsync(SelectedService.Id);
            if (res.Success)
            {
                StatusMessage = "Service removed successfully!";
                ResetForm();
                await LoadAsync();
            }
            else
            {
                StatusMessage = $"Cannot delete: {res.Message}";
                MessageBox.Show(res.Message, "Delete Rejected", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }
    }
}
