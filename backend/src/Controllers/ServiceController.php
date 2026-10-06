<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Service;

class ServiceController
{
    private Service $services;

    public function __construct()
    {
        $this->services = new Service();
    }

    /**
     * GET /api/services  (public)
     * Returns all available services grouped by category.
     */
    public function index(Request $request): void
    {
        $rows = $this->services->listAvailable();

        // Group by category for the frontend
        $grouped = [];
        foreach ($rows as $row) {
            $grouped[$row['category']][] = [
                'id'          => (int) $row['id'],
                'name'        => $row['name'],
                'category'    => $row['category'],
                'unit_price'  => (float) $row['unit_price'],
                'description' => $row['description'],
            ];
        }

        Response::success([
            'services' => $rows,
            'grouped'  => $grouped,
        ], 'Services loaded');
    }
}