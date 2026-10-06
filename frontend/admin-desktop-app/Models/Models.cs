using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace LaundryAdminApp.Models
{
    public class AdminUser
    {
        [JsonProperty("id")]            public int Id { get; set; }
        [JsonProperty("full_name")]     public string FullName { get; set; } = "";
        [JsonProperty("email")]         public string Email { get; set; } = "";
        [JsonProperty("is_active")]     public int IsActive { get; set; } = 1;
        [JsonProperty("last_login_at")] public string? LastLoginAt { get; set; }
        [JsonProperty("created_at")]    public string? CreatedAt { get; set; }
    }

    public class ServiceItem
    {
        [JsonProperty("id")]           public int Id { get; set; }
        [JsonProperty("name")]         public string Name { get; set; } = "";
        [JsonProperty("category")]     public string Category { get; set; } = "";
        [JsonProperty("unit_price")]   public decimal UnitPrice { get; set; }
        [JsonProperty("description")]  public string? Description { get; set; }
        [JsonProperty("is_available")] public int IsAvailable { get; set; } = 1;
        [JsonProperty("created_at")]   public string? CreatedAt { get; set; }

        public string FormattedPrice   => $"\u20a6{UnitPrice:N0}";
        public bool IsActiveBool       => IsAvailable == 1;
        public string StatusBadge      => IsAvailable == 1 ? "Active" : "Disabled";
        public string StatusBadgeColor => IsAvailable == 1 ? "#10B981" : "#EF4444";
    }

    public class Customer
    {
        [JsonProperty("id")]             public int Id { get; set; }
        [JsonProperty("full_name")]      public string FullName { get; set; } = "";
        [JsonProperty("email")]          public string Email { get; set; } = "";
        [JsonProperty("phone")]          public string Phone { get; set; } = "";
        [JsonProperty("address")]        public string? Address { get; set; }
        [JsonProperty("is_active")]      public int IsActive { get; set; } = 1;
        [JsonProperty("created_at")]     public string? CreatedAt { get; set; }
        [JsonProperty("order_count")]    public int OrderCount { get; set; }
        [JsonProperty("lifetime_value")] public decimal LifetimeValue { get; set; }

        public bool IsActiveBool       => IsActive == 1;
        public string StatusText       => IsActive == 1 ? "Active" : "Suspended";
        public string StatusColor      => IsActive == 1 ? "#10B981" : "#EF4444";
        public string FormattedSpent   => $"\u20a6{LifetimeValue:N0}";
    }

    public class OrderItem
    {
        [JsonProperty("id")]           public int Id { get; set; }
        [JsonProperty("order_id")]     public int OrderId { get; set; }
        [JsonProperty("service_id")]   public int ServiceId { get; set; }
        [JsonProperty("service_name")] public string ServiceName { get; set; } = "";
        [JsonProperty("category")]     public string Category { get; set; } = "";
        [JsonProperty("quantity")]     public int Quantity { get; set; }
        [JsonProperty("unit_price")]   public decimal UnitPrice { get; set; }
        [JsonProperty("line_total")]   public decimal LineTotal { get; set; }

        public string FormattedPrice     => $"\u20a6{UnitPrice:N0}";
        public string FormattedLineTotal => $"\u20a6{LineTotal:N0}";
    }

    public class Order
    {
        [JsonProperty("id")]               public int Id { get; set; }
        [JsonProperty("order_code")]       public string OrderCode { get; set; } = "";
        [JsonProperty("user_id")]          public int UserId { get; set; }
        [JsonProperty("status")]           public string Status { get; set; } = "pending";
        [JsonProperty("pickup_address")]   public string PickupAddress { get; set; } = "";
        [JsonProperty("pickup_date")]      public string PickupDate { get; set; } = "";
        [JsonProperty("pickup_time")]      public string PickupTime { get; set; } = "";
        [JsonProperty("delivery_address")] public string DeliveryAddress { get; set; } = "";
        [JsonProperty("delivery_date")]    public string DeliveryDate { get; set; } = "";
        [JsonProperty("delivery_time")]    public string DeliveryTime { get; set; } = "";
        [JsonProperty("special_notes")]    public string? SpecialNotes { get; set; }
        [JsonProperty("subtotal")]         public decimal Subtotal { get; set; }
        [JsonProperty("total")]            public decimal Total { get; set; }
        [JsonProperty("payment_status")]   public string PaymentStatus { get; set; } = "unpaid";
        [JsonProperty("created_at")]       public string? CreatedAt { get; set; }
        [JsonProperty("updated_at")]       public string? UpdatedAt { get; set; }

        // Joined customer info
        [JsonProperty("user_name")]        public string? UserName { get; set; }
        [JsonProperty("user_email")]       public string? UserEmail { get; set; }
        [JsonProperty("user_phone")]       public string? UserPhone { get; set; }

        [JsonProperty("items")]            public List<OrderItem> Items { get; set; } = new();

        public string DisplayCustomer      => !string.IsNullOrWhiteSpace(UserName) ? UserName : $"User #{UserId}";
        public string FormattedTotal       => $"\u20a6{Total:N0}";
        public string FormattedSubtotal    => $"\u20a6{Subtotal:N0}";
        public string StatusDisplay        => Status.Replace('_', ' ').ToUpper();
        public string ItemsCountSummary    => Items != null && Items.Count > 0 ? $"{Items.Count} item{(Items.Count > 1 ? "s" : "")}" : "Standard";

        public string StatusColor => Status?.ToLower() switch
        {
            "pending"           => "#F59E0B",
            "picked_up"         => "#38BDF8",
            "washing"           => "#818CF8",
            "ready"             => "#34D399",
            "out_for_delivery"  => "#A78BFA",
            "delivered"         => "#10B981",
            "cancelled"         => "#EF4444",
            _                   => "#94A3B8"
        };

        public string PaymentColor => PaymentStatus?.ToLower() switch
        {
            "paid"     => "#10B981",
            "unpaid"   => "#F59E0B",
            "refunded" => "#EF4444",
            _          => "#94A3B8"
        };
    }

    public class Payment
    {
        [JsonProperty("id")]             public int Id { get; set; }
        [JsonProperty("order_id")]       public int OrderId { get; set; }
        [JsonProperty("user_id")]        public int UserId { get; set; }
        [JsonProperty("amount")]         public decimal Amount { get; set; }
        [JsonProperty("method")]         public string Method { get; set; } = "cash";
        [JsonProperty("status")]         public string Status { get; set; } = "pending";
        [JsonProperty("reference")]      public string? Reference { get; set; }
        [JsonProperty("paid_at")]        public string? PaidAt { get; set; }
        [JsonProperty("created_at")]     public string? CreatedAt { get; set; }
        [JsonProperty("order_code")]     public string? OrderCode { get; set; }
        [JsonProperty("customer_name")]  public string? CustomerName { get; set; }

        public string FormattedAmount    => $"\u20a6{Amount:N0}";
        public string MethodDisplay      => Method?.ToUpper() ?? "CASH";
        public string StatusDisplay      => Status?.ToUpper() ?? "PENDING";
        public string StatusColor => Status?.ToLower() switch
        {
            "success"  => "#10B981",
            "pending"  => "#F59E0B",
            "failed"   => "#EF4444",
            "refunded" => "#6B7280",
            _          => "#94A3B8"
        };
    }

    public class DashboardMetrics
    {
        [JsonProperty("total_orders")]      public int TotalOrders { get; set; }
        [JsonProperty("today_orders")]      public int TodayOrders { get; set; }
        [JsonProperty("pending_orders")]    public int PendingOrders { get; set; }
        [JsonProperty("delivered_orders")]  public int DeliveredOrders { get; set; }
        [JsonProperty("revenue_total")]     public decimal RevenueTotal { get; set; }
        [JsonProperty("revenue_today")]     public decimal RevenueToday { get; set; }
        [JsonProperty("total_customers")]   public int TotalCustomers { get; set; }

        public string FormattedRevenueTotal => $"\u20a6{RevenueTotal:N0}";
        public string FormattedRevenueToday => $"\u20a6{RevenueToday:N0}";
    }

    public class StatusCountItem
    {
        [JsonProperty("status")] public string Status { get; set; } = "";
        [JsonProperty("count")]  public int Count { get; set; }
        public string StatusName => Status.Replace('_', ' ').ToUpper();
    }

    public class DashboardData
    {
        [JsonProperty("metrics")]       public DashboardMetrics Metrics { get; set; } = new();
        [JsonProperty("recent_orders")] public List<Order> RecentOrders { get; set; } = new();
        [JsonProperty("by_status")]     public List<StatusCountItem> ByStatus { get; set; } = new();
    }

    public class ApiResponse<T>
    {
        [JsonProperty("status")]  public string Status { get; set; } = "";
        [JsonProperty("message")] public string Message { get; set; } = "";
        [JsonProperty("data")]    public T? Data { get; set; }
        [JsonProperty("errors")]  public object? Errors { get; set; }

        public bool Success => string.Equals(Status, "success", StringComparison.OrdinalIgnoreCase);
    }

    public class LoginResult
    {
        [JsonProperty("admin")] public AdminUser Admin { get; set; } = new();
        [JsonProperty("token")] public string Token { get; set; } = "";
    }

    public class ServiceListResult
    {
        [JsonProperty("services")] public List<ServiceItem> Services { get; set; } = new();
    }

    public class OrderListResult
    {
        [JsonProperty("orders")] public List<Order> Orders { get; set; } = new();
    }

    public class SingleOrderResult
    {
        [JsonProperty("order")] public Order Order { get; set; } = new();
    }

    public class UserListResult
    {
        [JsonProperty("users")] public List<Customer> Users { get; set; } = new();
    }

    public class PaymentListResult
    {
        [JsonProperty("payments")] public List<Payment> Payments { get; set; } = new();
    }

    public class RevenueReportResult
    {
        [JsonProperty("total_revenue")] public decimal TotalRevenue { get; set; }
        [JsonProperty("by_day")]        public List<RevenueDayItem> ByDay { get; set; } = new();
    }

    public class RevenueDayItem
    {
        [JsonProperty("day")]     public string Day { get; set; } = "";
        [JsonProperty("revenue")] public decimal Revenue { get; set; }
        public string FormattedRevenue => $"\u20a6{Revenue:N0}";
    }
}
