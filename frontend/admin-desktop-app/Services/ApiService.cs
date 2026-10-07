using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using LaundryAdminApp.Models;

namespace LaundryAdminApp.Services
{
    public class ApiService
    {
        private static ApiService? _instance;
        public static ApiService Instance => _instance ??= new ApiService();

        private readonly HttpClient _http;
        private string _baseUrl = "https://laundry-backend-k2ez.onrender.com";
        private string _token = "";

        public string BaseUrl => _baseUrl;
        public AdminUser? CurrentAdmin { get; private set; }
        public bool IsAuthenticated => !string.IsNullOrEmpty(_token);

        public event Action? OnAuthChanged;

        private ApiService()
        {
            var handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (_, _, _, _) => true
            };
            _http = new HttpClient(handler)
            {
                Timeout = TimeSpan.FromSeconds(25)
            };
        }

        public void SetBaseUrl(string url)
        {
            _baseUrl = url.TrimEnd('/');
        }

        public void SetToken(string token)
        {
            _token = token;
            _http.DefaultRequestHeaders.Authorization = string.IsNullOrEmpty(token)
                ? null
                : new AuthenticationHeaderValue("Bearer", token);
            OnAuthChanged?.Invoke();
        }

        private async Task<ApiResponse<T>> SendAsync<T>(HttpRequestMessage req)
        {
            try
            {
                var resp = await _http.SendAsync(req);
                var rawJson = await resp.Content.ReadAsStringAsync();

                if (!string.IsNullOrWhiteSpace(rawJson))
                {
                    try
                    {
                        var parsed = JsonConvert.DeserializeObject<ApiResponse<T>>(rawJson);
                        if (parsed != null)
                        {
                            return parsed;
                        }
                    }
                    catch (Exception)
                    {
                        // Try parsing raw data or error structure
                        try
                        {
                            var jObj = JObject.Parse(rawJson);
                            var status = jObj["status"]?.ToString() ?? (resp.IsSuccessStatusCode ? "success" : "error");
                            var message = jObj["message"]?.ToString() ?? "";
                            T? data = default;

                            if (jObj["data"] != null)
                            {
                                data = jObj["data"]!.ToObject<T>();
                            }

                            return new ApiResponse<T>
                            {
                                Status = status,
                                Message = message,
                                Data = data
                            };
                        }
                        catch { }
                    }
                }

                return new ApiResponse<T>
                {
                    Status = resp.IsSuccessStatusCode ? "success" : "error",
                    Message = resp.IsSuccessStatusCode ? "Success" : $"Server responded with {(int)resp.StatusCode} {resp.StatusCode}"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<T>
                {
                    Status = "error",
                    Message = $"Connection failed: {ex.Message}"
                };
            }
        }

        private HttpRequestMessage CreateRequest(HttpMethod method, string path, object? body = null)
        {
            var req = new HttpRequestMessage(method, $"{_baseUrl}/{path.TrimStart('/')}");
            if (body != null)
            {
                var json = JsonConvert.SerializeObject(body);
                req.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }
            return req;
        }

        // ================= AUTH =================
        public async Task<ApiResponse<LoginResult>> LoginAsync(string email, string password)
        {
            var req = CreateRequest(HttpMethod.Post, "api/admin/auth/login", new { email, password });
            var res = await SendAsync<LoginResult>(req);
            if (res.Success && res.Data != null)
            {
                CurrentAdmin = res.Data.Admin;
                SetToken(res.Data.Token);
            }
            return res;
        }

        public async Task<ApiResponse<AdminUser>> GetMeAsync()
        {
            var req = CreateRequest(HttpMethod.Get, "api/admin/auth/me");
            var res = await SendAsync<AdminUser>(req);
            if (res.Success && res.Data != null)
            {
                CurrentAdmin = res.Data;
            }
            return res;
        }

        public async Task<ApiResponse<object>> ChangePasswordAsync(string currentPassword, string newPassword, string confirmPassword)
        {
            var req = CreateRequest(HttpMethod.Patch, "api/admin/auth/password", new
            {
                current_password = currentPassword,
                new_password = newPassword,
                new_password_confirmation = confirmPassword
            });
            return await SendAsync<object>(req);
        }

        public void Logout()
        {
            CurrentAdmin = null;
            SetToken(string.Empty);
        }

        // ================= DASHBOARD =================
        public async Task<ApiResponse<DashboardData>> GetDashboardAsync()
        {
            var req = CreateRequest(HttpMethod.Get, "api/admin/dashboard");
            return await SendAsync<DashboardData>(req);
        }

        // ================= ORDERS =================
        public async Task<ApiResponse<OrderListResult>> GetOrdersAsync(string? status = null, string? paymentStatus = null, string? search = null)
        {
            var query = new List<string> { "per_page=100" };
            if (!string.IsNullOrEmpty(status) && status != "All") query.Add($"status={Uri.EscapeDataString(status.ToLower().Replace(' ', '_'))}");
            if (!string.IsNullOrEmpty(paymentStatus) && paymentStatus != "All") query.Add($"payment_status={Uri.EscapeDataString(paymentStatus.ToLower())}");
            if (!string.IsNullOrWhiteSpace(search)) query.Add($"search={Uri.EscapeDataString(search)}");

            var path = "api/admin/orders?" + string.Join("&", query);
            var req = CreateRequest(HttpMethod.Get, path);
            return await SendAsync<OrderListResult>(req);
        }

        public async Task<ApiResponse<SingleOrderResult>> GetOrderDetailsAsync(int orderId)
        {
            var req = CreateRequest(HttpMethod.Get, $"api/admin/orders/{orderId}");
            return await SendAsync<SingleOrderResult>(req);
        }

        public async Task<ApiResponse<SingleOrderResult>> UpdateOrderStatusAsync(int orderId, string status)
        {
            var cleanStatus = status.ToLower().Replace(' ', '_');
            var req = CreateRequest(HttpMethod.Patch, $"api/admin/orders/{orderId}/status", new { status = cleanStatus });
            return await SendAsync<SingleOrderResult>(req);
        }

        public async Task<ApiResponse<SingleOrderResult>> UpdateOrderPaymentStatusAsync(int orderId, string paymentStatus)
        {
            var cleanPayment = paymentStatus.ToLower();
            var req = CreateRequest(HttpMethod.Patch, $"api/admin/orders/{orderId}/payment", new { payment_status = cleanPayment });
            return await SendAsync<SingleOrderResult>(req);
        }

        // ================= SERVICES =================
        public async Task<ApiResponse<ServiceListResult>> GetServicesAsync()
        {
            var req = CreateRequest(HttpMethod.Get, "api/admin/services");
            return await SendAsync<ServiceListResult>(req);
        }

        public async Task<ApiResponse<object>> CreateServiceAsync(string name, string category, decimal price, string? description, int isAvailable)
        {
            var req = CreateRequest(HttpMethod.Post, "api/admin/services", new
            {
                name,
                category,
                unit_price = price,
                description,
                is_available = isAvailable
            });
            return await SendAsync<object>(req);
        }

        public async Task<ApiResponse<object>> UpdateServiceAsync(int id, string name, string category, decimal price, string? description, int isAvailable)
        {
            var req = CreateRequest(HttpMethod.Put, $"api/admin/services/{id}", new
            {
                name,
                category,
                unit_price = price,
                description,
                is_available = isAvailable
            });
            return await SendAsync<object>(req);
        }

        public async Task<ApiResponse<object>> UpdateServiceAvailabilityAsync(int id, int isAvailable)
        {
            var req = CreateRequest(HttpMethod.Patch, $"api/admin/services/{id}/availability", new
            {
                is_available = isAvailable
            });
            return await SendAsync<object>(req);
        }

        public async Task<ApiResponse<object>> DeleteServiceAsync(int id)
        {
            var req = CreateRequest(HttpMethod.Delete, $"api/admin/services/{id}");
            return await SendAsync<object>(req);
        }

        // ================= CUSTOMERS =================
        public async Task<ApiResponse<UserListResult>> GetCustomersAsync(string? search = null)
        {
            var path = "api/admin/users?per_page=100";
            if (!string.IsNullOrWhiteSpace(search)) path += $"&search={Uri.EscapeDataString(search)}";
            var req = CreateRequest(HttpMethod.Get, path);
            return await SendAsync<UserListResult>(req);
        }

        public async Task<ApiResponse<object>> UpdateCustomerStatusAsync(int id, int isActive)
        {
            var req = CreateRequest(HttpMethod.Patch, $"api/admin/users/{id}/status", new
            {
                is_active = isActive
            });
            return await SendAsync<object>(req);
        }

        // ================= PAYMENTS =================
        public async Task<ApiResponse<PaymentListResult>> GetPaymentsAsync(string? status = null, string? method = null)
        {
            var query = new List<string> { "per_page=100" };
            if (!string.IsNullOrEmpty(status) && status != "All") query.Add($"status={Uri.EscapeDataString(status.ToLower())}");
            if (!string.IsNullOrEmpty(method) && method != "All") query.Add($"method={Uri.EscapeDataString(method.ToLower())}");
            var path = "api/admin/payments?" + string.Join("&", query);
            var req = CreateRequest(HttpMethod.Get, path);
            return await SendAsync<PaymentListResult>(req);
        }

        public async Task<ApiResponse<object>> RecordPaymentAsync(int orderId, decimal amount, string method, string status, string? reference)
        {
            var req = CreateRequest(HttpMethod.Post, "api/admin/payments", new
            {
                order_id = orderId,
                amount,
                method = method.ToLower(),
                status = status.ToLower(),
                reference
            });
            return await SendAsync<object>(req);
        }

        // ================= REPORTS =================
        public async Task<ApiResponse<RevenueReportResult>> GetRevenueReportAsync(string? fromDate = null, string? toDate = null)
        {
            var path = "api/admin/reports/revenue";
            var query = new List<string>();
            if (!string.IsNullOrEmpty(fromDate)) query.Add($"from_date={fromDate}");
            if (!string.IsNullOrEmpty(toDate)) query.Add($"to_date={toDate}");
            if (query.Count > 0) path += "?" + string.Join("&", query);

            var req = CreateRequest(HttpMethod.Get, path);
            return await SendAsync<RevenueReportResult>(req);
        }
    }
}
