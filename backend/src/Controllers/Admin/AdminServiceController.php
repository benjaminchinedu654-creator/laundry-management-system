<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Exceptions\HttpException;
use App\Helpers\Validator;
use App\Models\Service;

class AdminServiceController
{
    private Service  $services;
    private Database $db;

    public function __construct()
    {
        $this->services = new Service();
        $this->db       = new Database();
    }

    /**
     * GET /api/admin/services
     * Includes unavailable services.
     */
    public function index(Request $request): void
    {
        Response::success([
            'services' => $this->services->listAll(),
        ], 'Services loaded');
    }

    /**
     * POST /api/admin/services
     * Body: { name, category, unit_price, description?, is_available? }
     */
    public function store(Request $request): void
    {
        $data = $request->all();

        Validator::make($data)
            ->required('name', 'Name')->max('name', 100, 'Name')
            ->required('category', 'Category')->max('category', 50, 'Category')
            ->required('unit_price', 'Unit price')->numeric('unit_price', 'Unit price')
            ->validate();

        if ((float) $data['unit_price'] < 0) {
            throw new HttpException(422, 'Unit price cannot be negative.', [
                'unit_price' => ['Unit price must be zero or greater.'],
            ]);
        }

        // Prevent duplicate (name + category)
        $exists = $this->db->exists(
            'services',
            'name = :n AND category = :c',
            ['n' => $data['name'], 'c' => $data['category']]
        );
        if ($exists) {
            throw new HttpException(409, 'A service with this name and category already exists.');
        }

        $id = $this->services->create([
            'name'         => trim((string) $data['name']),
            'category'     => trim((string) $data['category']),
            'unit_price'   => round((float) $data['unit_price'], 2),
            'description'  => isset($data['description']) ? trim((string) $data['description']) : null,
            'is_available' => isset($data['is_available']) ? (int) $data['is_available'] : 1,
        ]);

        Response::success([
            'service' => $this->services->findById($id),
        ], 'Service created', 201);
    }

    /**
     * GET /api/admin/services/{id}
     */
    public function show(Request $request, array $params): void
    {
        $id = (int) ($params['id'] ?? 0);
        $service = $this->services->findById($id);

        if (!$service) {
            throw new HttpException(404, 'Service not found.');
        }

        Response::success(['service' => $service], 'Service loaded');
    }

    /**
     * PUT /api/admin/services/{id}
     * Body: { name?, category?, unit_price?, description?, is_available? }
     */
    public function update(Request $request, array $params): void
    {
        $id = (int) ($params['id'] ?? 0);
        $service = $this->services->findById($id);

        if (!$service) {
            throw new HttpException(404, 'Service not found.');
        }

        $data = $request->all();

        Validator::make($data)
            ->max('name', 100, 'Name')
            ->max('category', 50, 'Category')
            ->numeric('unit_price', 'Unit price')
            ->validate();

        if (isset($data['unit_price']) && (float) $data['unit_price'] < 0) {
            throw new HttpException(422, 'Unit price cannot be negative.', [
                'unit_price' => ['Unit price must be zero or greater.'],
            ]);
        }

        // Uniqueness check if name OR category changed
        $newName = $data['name']     ?? $service['name'];
        $newCat  = $data['category'] ?? $service['category'];
        if ($newName !== $service['name'] || $newCat !== $service['category']) {
            $dup = $this->db->exists(
                'services',
                'name = :n AND category = :c AND id <> :id',
                ['n' => $newName, 'c' => $newCat, 'id' => $id]
            );
            if ($dup) {
                throw new HttpException(409, 'Another service with this name and category already exists.');
            }
        }

        $updates = [];
        if (array_key_exists('name', $data))         $updates['name'] = trim((string) $data['name']);
        if (array_key_exists('category', $data))     $updates['category'] = trim((string) $data['category']);
        if (array_key_exists('unit_price', $data))   $updates['unit_price'] = round((float) $data['unit_price'], 2);
        if (array_key_exists('description', $data))  $updates['description'] = trim((string) $data['description']);
        if (array_key_exists('is_available', $data)) $updates['is_available'] = (int) $data['is_available'];

        if (!empty($updates)) {
            $this->services->update($id, $updates);
        }

        Response::success([
            'service' => $this->services->findById($id),
        ], 'Service updated');
    }

    /**
     * PATCH /api/admin/services/{id}/availability
     * Body: { is_available: 0|1 }
     */
    public function updateAvailability(Request $request, array $params): void
    {
        $id = (int) ($params['id'] ?? 0);
        $service = $this->services->findById($id);

        if (!$service) {
            throw new HttpException(404, 'Service not found.');
        }

        $data = $request->all();
        if (!array_key_exists('is_available', $data)) {
            throw new HttpException(422, 'is_available is required.');
        }

        $available = (int) $data['is_available'] === 1;
        $this->services->setAvailability($id, $available);

        Response::success([
            'service' => $this->services->findById($id),
        ], $available ? 'Service enabled' : 'Service disabled');
    }

    /**
     * DELETE /api/admin/services/{id}
     * Rejects deletion if the service has been used in any order.
     */
    public function destroy(Request $request, array $params): void
    {
        $id = (int) ($params['id'] ?? 0);
        $service = $this->services->findById($id);

        if (!$service) {
            throw new HttpException(404, 'Service not found.');
        }

        // Block deletion if it has been used in an order
        $used = $this->db->exists(
            'order_items',
            'service_id = :sid',
            ['sid' => $id]
        );
        if ($used) {
            throw new HttpException(409, 'This service has been used in existing orders. Disable it instead.');
        }

        $this->services->delete($id);
        Response::success(null, 'Service deleted');
    }
}