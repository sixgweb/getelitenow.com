# October CMS AI Coding Instructions

## Project Overview

This is an **October CMS v4.x** application (Laravel 12-based CMS) with custom plugins and themes for the Elite Physique fitness website.

### Key Architecture Components

- **Core Modules** (`modules/`): Backend, CMS, System, Tailor, Dashboard, Media - the October CMS framework
- **Plugins** (`plugins/sixgweb/`): Custom functionality - ClubReady, InstagramFeed, PlacesReviews
- **Theme** (`themes/elitephysique/`): Frontend presentation layer with layouts, pages, partials
- **App** (`app/`): Application-level customizations via `Provider.php` and Tailor blueprints (`app/blueprints/`)

## Plugin Development Patterns

### Plugin Structure (Namespace: `Sixgweb\PluginName`)

```
plugins/sixgweb/{pluginname}/
├── Plugin.php              # Registration: components, permissions, navigation, settings
├── controllers/            # Backend controllers with FormController/ListController behaviors
├── models/                 # Database models (extend October\Rain\Database\Model)
├── components/             # Frontend components (extend Cms\Classes\ComponentBase)
├── updates/                # Database migrations and version.yaml
└── {config_form.yaml, config_list.yaml, fields.yaml, columns.yaml}
```

### Controller Implementation Pattern

Backend controllers in `plugins/sixgweb/*/controllers/` implement **behaviors** not inheritance:

```php
public $implement = [
    \Backend\Behaviors\FormController::class,
    \Backend\Behaviors\ListController::class,
    \Backend\Behaviors\RelationController::class,  // For managing relationships
];

public $formConfig = 'config_form.yaml';
public $listConfig = 'config_list.yaml';
public $relationConfig = 'config_relation.yaml';
```

**Never extend FormController directly** - use `$implement` array and behavior files.

### Model Conventions

- Models extend `October\Rain\Database\Model` or `System\Models\SettingModel` (for settings)
- Use traits for features: `\October\Rain\Database\Traits\Encryptable`, `\October\Rain\Database\Traits\Validation`
- Relationships: `$hasMany`, `$belongsTo`, `$belongsToMany`, `$hasOne` as public properties
- Example from `InstagramSetting.php`:
  ```php
  use \October\Rain\Database\Traits\Encryptable;
  protected $encryptable = ['access_token', 'refresh_token'];
  public $settingsCode = 'sixgweb_instagramfeed_settings';
  public $settingsFields = 'fields.yaml';
  ```

### Form/List Configuration

Configuration files use **tilde paths** (`~`) to reference plugin directories:

```yaml
# config_form.yaml
form: ~/plugins/sixgweb/pluginname/models/model/fields.yaml
# config_list.yaml
list: ~/plugins/sixgweb/pluginname/models/model/columns.yaml
```

## Theme Development (October CMS Pages)

### Page Structure (`themes/elitephysique/pages/*.htm`)

October CMS pages use **INI-style configuration** + Twig markup:

```october-htm
url = "/"
layout = "default"
title = "Home"

[componentAlias]
propertyName = "value"
arrayProperty[] = "value1"
arrayProperty[] = "value2"
==
{# Twig markup #}
{% component 'componentAlias' %}
```

**Key differences from typical frameworks:**
- Configuration section (before `==`) uses INI format, not YAML
- Components are configured in page headers, not in code
- Array properties use bracket notation: `types[] = "value"`

### Component Registration

In `Plugin.php`:
```php
public function registerComponents()
{
    return [
        'Sixgweb\ClubReady\Components\Packages' => 'packageList',  // Alias used in pages
        'Sixgweb\ClubReady\Components\Staff' => 'staffList',
    ];
}
```

## Tailor Blueprints (Content Modeling)

Blueprints in `app/blueprints/` define content structures:

```yaml
handle: Site\Menus      # Namespace for the blueprint
type: structure         # Options: structure, entry, stream, global, mixin
name: Menu
fields:                 # Field definitions
  field_name:
    label: Label
    type: dropdown      # Form widget type
    trigger:            # Conditional field visibility
      action: show
      field: other_field
      condition: value
```

**Tailor replaces the old Builder plugin** - it's October's native content modeling system.

## Development Workflows

### Essential Artisan Commands

```bash
# Initial setup
php artisan october:install

# Database migrations
php artisan october:migrate          # Migrate core + all plugins
php artisan plugin:refresh Author.Plugin  # Rollback/migrate specific plugin

# Plugin management
php artisan plugin:install Author.Plugin
php artisan plugin:refresh Author.Plugin  # Use after model/migration changes

# Theme management
php artisan theme:use elitephysique
php artisan theme:seed                # Seed blueprints and data

# Tailor (content structures)
php artisan tailor:migrate
php artisan tailor:refresh

# Updates
php artisan october:update            # Update core + plugins + run migrations
```

### Asset Compilation

Uses **Laravel Mix** (see `webpack.mix.js`, `package.json`):

```bash
npm run dev          # Development build
npm run watch        # Watch mode
npm run production   # Production build (minified)
```

Individual modules have their own mix configs: `modules/backend/backend.mix.js`, `modules/cms/cms.mix.js`

### Testing

```bash
composer test        # Runs PHPUnit
composer lint        # Runs PHP_CodeSniffer
```

## Code Conventions

- **PSR-4 autoloading**, PSR-1/PSR-2 coding standards
- **Namespace pattern**: `Sixgweb\PluginName` for custom plugins, `October\Rain` for framework
- **Backend URLs**: `Backend::url('sixgweb/clubready/packages')` generates `/backend/sixgweb/clubready/packages`
- **Form field extensions**: Override `formExtendFields($form)` in controllers to modify fields
- **Settings models**: Use `SettingModel::get('key')` and `SettingModel::set('key', 'value')` for reading/writing

## October CMS-Specific Patterns

### Form Widget System

FormWidgets are backend form controls. Common types in field definitions:
- `codeeditor`, `richeditor`, `mediafinder`, `fileupload`
- `relation`, `recordfinder`, `repeater`, `nestedform`
- `datepicker`, `colorpicker`, `dropdown`, `checkbox`

Custom form widgets registered in `Plugin.php`:
```php
public function registerFormWidgets()
{
    return [
        'Sixgweb\Plugin\FormWidgets\CustomWidget' => 'customwidget'
    ];
}
```

### Relationship Management

Use `RelationController` behavior for managing model relationships in the backend:

```php
public $relationConfig = 'config_relation.yaml';
```

Config defines view/manage modes for `hasMany`, `belongsToMany`, etc.

### Backend Navigation

Register backend menu items in `Plugin.php`:

```php
public function registerNavigation()
{
    return [
        'menukey' => [
            'label' => 'Menu Label',
            'url' => Backend::url('author/plugin/controller'),
            'icon' => 'icon-leaf',
            'permissions' => ['author.plugin.access'],
            'sideMenu' => [...]
        ]
    ];
}
```

## Common Gotchas

1. **Settings Models**: Call `->save()` explicitly, or use `::set()` static method
2. **Component Properties**: Defined as public properties with `public function defineProperties()` method
3. **Migrations**: Version tracked in `updates/version.yaml`, not timestamp-based like Laravel
4. **File References**: Use `$` (request variables) or `this.page` (Twig) for page properties, not route parameters
5. **AJAX Handlers**: In components, prefix with `on*` (e.g., `onLoadMore`). In pages, use `{% framework %}` tag.

## Environment Configuration

- `.env` file for environment-specific config (database, app key, debug mode)
- `config/` directory mirrors Laravel config files
- October-specific configs: `config/cms.php`, `config/backend.php`, `config/system.php`

## Dependencies

- **PHP**: ^8.2 (see `composer.json`)
- **Laravel Framework**: ^12.0
- **October Rain Library**: ^4.1 (core October utilities)
- **Frontend**: Bootstrap 5.3, Chart.js, Vue 2.6, jQuery 3.6
