using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using LaundryAdminApp.Models;
using LaundryAdminApp.Services;

namespace LaundryAdminApp.ViewModels
{
    public class PaymentsViewModel : BaseViewModel
    {
        public List<string> StatusFilters { get; } = new()
        {
            "All", "Success", "Pending", "Failed", "Refunded"
        };

        public List<string> MethodFilters { get; } = new()
        {
            "All", "Cash", "Card", "Transfer"
        };

        public List<string> FormMethods { get; } = new()
        {
            "cash", "card", "transfer"
        };

        public List<string> FormStatuses { get; } = new()
        {
            "success", "pending", "failed"
        };

        private string _selectedStatus = "All";
        public string SelectedStatus
        {
            get => _selectedStatus;
            set
            {
                if (Set(ref _selectedStatus, value))
                    _ = LoadAsync();
            }
        }

        private string _selectedMethod = "All";
        public string SelectedMethod
        {
            get => _selectedMethod;
            set
            {
                if (Set(ref _selectedMethod, value))
                    _ = LoadAsync();
            }
        }

        private ObservableCollection<Payment> _payments = new();
        public ObservableCollection<Payment> Payments
        {
            get => _payments;
            set => Set(ref _payments, value);
        }

        private Payment? _selectedPayment;
        public Payment? SelectedPayment
        {
            get => _selectedPayment;
            set => Set(ref _selectedPayment, value);
        }

        // Form Fields for Manual Payment
        private string _formOrderId = "";
        public string FormOrderId { get => _formOrderId; set => Set(ref _formOrderId, value); }

        private string _formAmount = "";
        public string FormAmount { get => _formAmount; set => Set(ref _formAmount, value); }

        private string _formMethod = "cash";
        public string FormMethod { get => _formMethod; set => Set(ref _formMethod, value); }

        private string _formStatus = "success";
        public string FormStatus { get => _formStatus; set => Set(ref _formStatus, value); }

        private string _formReference = "";
        public string FormReference { get => _formReference; set => Set(ref _formReference, value); }

        private bool _isLoading;
        public bool IsLoading { get => _isLoading; set => Set(ref _isLoading, value); }

        private string _statusMessage = "";
        public string StatusMessage { get => _statusMessage; set => Set(ref _statusMessage, value); }

        public ICommand RefreshCommand { get; }
        public ICommand RecordPaymentCommand { get; }

        public PaymentsViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadAsync());
            RecordPaymentCommand = new RelayCommand(async () => await RecordPaymentAsync());
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            StatusMessage = "Loading payments ledger...";
            try
            {
                var res = await ApiService.Instance.GetPaymentsAsync(SelectedStatus, SelectedMethod);
                if (res.Success && res.Data?.Payments != null)
                {
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        Payments.Clear();
                        foreach (var pay in res.Data.Payments) Payments.Add(pay);
                    });
                    StatusMessage = $"Loaded {Payments.Count} payments ({DateTime.Now:T})";
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

        private async Task RecordPaymentAsync()
        {
            if (!int.TryParse(FormOrderId, out var orderId) || orderId <= 0)
            {
                StatusMessage = "Please enter a valid numeric Order ID.";
                return;
            }

            if (!decimal.TryParse(FormAmount, out var amount) || amount <= 0)
            {
                StatusMessage = "Please enter a valid Amount greater than 0.";
                return;
            }

            IsLoading = true;
            StatusMessage = $"Recording payment of \u20a6{amount:N0} for Order #{orderId}...";
            try
            {
                var res = await ApiService.Instance.RecordPaymentAsync(
                    orderId, amount, FormMethod, FormStatus,
                    string.IsNullOrWhiteSpace(FormReference) ? null : FormReference.Trim());

                if (res.Success)
                {
                    StatusMessage = "Payment recorded successfully!";
                    FormOrderId = "";
                    FormAmount = "";
                    FormReference = "";
                    await LoadAsync();
                }
                else
                {
                    StatusMessage = $"Payment failed: {res.Message}";
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Record error: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}

