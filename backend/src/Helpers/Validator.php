<?php

declare(strict_types=1);

namespace App\Helpers;

use App\Core\Exceptions\HttpException;

class Validator
{
    private array $data;
    private array $errors = [];

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public static function make(array $data): self
    {
        return new self($data);
    }

    public function required(string $field, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = $this->data[$field] ?? null;

        if ($value === null || (is_string($value) && trim($value) === '') || $value === '') {
            $this->errors[$field][] = "{$label} is required.";
        }

        return $this;
    }

    public function email(string $field, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = trim((string) ($this->data[$field] ?? ''));

        if ($value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field][] = "{$label} must be a valid email address.";
        }

        return $this;
    }

    public function min(string $field, int $length, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = (string) ($this->data[$field] ?? '');

        if ($value !== '' && mb_strlen($value) < $length) {
            $this->errors[$field][] = "{$label} must be at least {$length} characters.";
        }

        return $this;
    }

    public function max(string $field, int $length, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = (string) ($this->data[$field] ?? '');

        if ($value !== '' && mb_strlen($value) > $length) {
            $this->errors[$field][] = "{$label} must not exceed {$length} characters.";
        }

        return $this;
    }

    public function phone(string $field, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = trim((string) ($this->data[$field] ?? ''));

        if ($value !== '' && !preg_match('/^\+?[0-9]{7,15}$/', str_replace([' ', '-'], '', $value))) {
            $this->errors[$field][] = "{$label} must be a valid phone number.";
        }

        return $this;
    }

    public function numeric(string $field, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && !is_numeric($value)) {
            $this->errors[$field][] = "{$label} must be a number.";
        }

        return $this;
    }

    public function in(string $field, array $allowed, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && !in_array($value, $allowed, true)) {
            $this->errors[$field][] = "{$label} must be one of: " . implode(', ', $allowed) . ".";
        }

        return $this;
    }

    public function date(string $field, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = (string) ($this->data[$field] ?? '');

        if ($value !== '') {
            $d = \DateTime::createFromFormat('Y-m-d', $value);
            if (!$d || $d->format('Y-m-d') !== $value) {
                $this->errors[$field][] = "{$label} must be a valid date (YYYY-MM-DD).";
            }
        }

        return $this;
    }

    public function time(string $field, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = (string) ($this->data[$field] ?? '');

        if ($value !== '' && !preg_match('/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/', $value)) {
            $this->errors[$field][] = "{$label} must be a valid time (HH:MM).";
        }

        return $this;
    }

    public function sameAs(string $field, string $otherField, ?string $label = null): self
    {
        $label = $label ?? $field;
        $value = $this->data[$field] ?? null;
        $other = $this->data[$otherField] ?? null;

        if ($value !== $other) {
            $this->errors[$field][] = "{$label} does not match.";
        }

        return $this;
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function validate(): void
    {
        if ($this->fails()) {
            throw new HttpException(422, 'Validation failed', $this->errors);
        }
    }
}
