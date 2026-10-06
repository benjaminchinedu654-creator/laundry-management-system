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
    public class OrdersViewModel : BaseViewModel
    {
        public List<string> StatusOptions { get; } = new()
        {
            "All", "Pending", "Picked Up", "Washing", "Ready", "Out For Delivery", "Delivered", "Cancelled"
        };

        public List<string> UpdatableStatuses { get; } = new()
        {
            "pending", "picked_up", "washing", "ready", "out_for_delivery", "delivered", "cancelled"
        };

        public List<string> PaymentOptions { get; } = new()
        {
            "All", "Unpaid", "Paid", "Refunded"
        };

        public List<string> UpdatablePaymentStatuses { get; } = new()
        {
            "unpaid", "paid", "refunded"
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

        private string _selectedPayment = "All";
        public string SelectedPayment
        {
            get => _selectedPayment;
            set
            {
                if (Set(ref _selectedPayment, value))
                    _ = LoadAsync();
            }
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

        private ObservableCollection<Order> _orders = new();
        public ObservableCollection<Order> Orders
        {
            get => _orders;
            set => Set(ref _orders, value);
        }

        private Order? _selectedOrder;
        public Order? SelectedOrder
        {
            get => _selectedOrder;
            set
            {
                if (Set(ref _selectedOrder, value))
                {
                    if (value != null)
                    {
                        NewStatusSelection = value.Status;
                        NewPaymentSelection = value.PaymentStatus;
                        _ = LoadOrderDetailsAsync(value.Id);
                    }
                }
            }
        }

        private string _newStatusSelection = "pending";
        public string NewStatusSelection
        {
            get => _newStatusSelection;
            set => Set(ref _newStatusSelection, value);
        }

        private string _newPaymentSelection = "unpaid";
        public string NewPaymentSelection
        {
            get => _newPaymentSelection;
            set => Set(ref _newPaymentSelection, value);
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
        public ICommand UpdateStatusCommand { get; }
        public ICommand UpdatePaymentCommand { get; }

        public OrdersViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadAsync());
            UpdateStatusCommand = new RelayCommand(async () => await UpdateSelectedOrderStatusAsync());
            UpdatePaymentCommand = new RelayCommand(async () => await UpdateSelectedOrderPaymentAsync());
        }

        public async Task LoadAsync()
        {
            IsLoading = true;
            StatusMessage = "Loading laundry orders...";
            try
            {
                var res = await ApiService.Instance.GetOrdersAsync(SelectedStatus, SelectedPayment, SearchText);
                if (res.Success && res.Data != null)
                {
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        Orders.Clear();
                        if (res.Data.Orders != null)
                        {
                            foreach (var ord in res.Data.Orders) Orders.Add(ord);
                        }
                    });
                    StatusMessage = $"Loaded {Orders.Count} orders ({DateTime.Now:T})";
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

        public async Task LoadOrderDetailsAsync(int orderId)
        {
            try
            {
                var res = await ApiService.Instance.GetOrderDetailsAsync(orderId);
                if (res.Success && res.Data?.Order != null)
                {
                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        if (SelectedOrder != null && SelectedOrder.Id == orderId)
                        {
                            SelectedOrder.Items = res.Data.Order.Items;
                            OnPropertyChanged(nameof(SelectedOrder));
                        }
                    });
                }
            }
            catch { }
        }

        private async Task UpdateSelectedOrderStatusAsync()
        {
            if (SelectedOrder == null) return;
            StatusMessage = $"Updating #{SelectedOrder.OrderCode} status to {NewStatusSelection}...";

            var res = await ApiService.Instance.UpdateOrderStatusAsync(SelectedOrder.Id, NewStatusSelection);
            if (res.Success)
            {
                SelectedOrder.Status = NewStatusSelection;
                OnPropertyChanged(nameof(SelectedOrder));
                StatusMessage = $"Order #{SelectedOrder.OrderCode} updated to {NewStatusSelection.ToUpper()}!";
                await LoadAsync();
            }
            else
            {
                StatusMessage = $"Failed: {res.Message}";
            }
        }

        private async Task UpdateSelectedOrderPaymentAsync()
        {
            if (SelectedOrder == null) return;
            StatusMessage = $"Updating #{SelectedOrder.OrderCode} payment to {NewPaymentSelection}...";

            var res = await ApiService.Instance.UpdateOrderPaymentStatusAsync(SelectedOrder.Id, NewPaymentSelection);
            if (res.Success)
            {
                SelectedOrder.PaymentStatus = NewPaymentSelection;
                OnPropertyChanged(nameof(SelectedOrder));
                StatusMessage = $"Order #{SelectedOrder.OrderCode} payment set to {NewPaymentSelection.ToUpper()}!";
                await LoadAsync();
            }
            else
            {
                StatusMessage = $"Failed: {res.Message}";
            }
        }
    }
}
