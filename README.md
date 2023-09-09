Web-site http://jewish-history-online.net/
==========================================

This is the code base for the presentation of the site. The generic parts
are factored out into a Symfony bundle:
    https://github.com/igdj/tei-edition-bundle

You can find a demo edition which demonstrates the use of that bundle
including step-by-step setup instructions at
    https://github.com/igdj/demo-edition

You may use or adjust code from this project if it fits your needs.
If you have any questions or find this code helpful, please contact us at
    http://jewish-history-online.net/contact

Installation Notes
------------------
Requirements
- PHP 7.3 or 7.4 (check with `php -v`)
  PHP 8 doesn't work yet (due to "solarium/solarium": "^5.1")
- composer (check with `composer -v`; if it is missing, see https://getcomposer.org/)
- MySQL or MariaDB (for metadata storage)
- Java 1.8 (for XSLT and Solr, check with `java -version`)
- `convert` (for image tiles, check with `which convert`; if it is missing, install e.g. with `sudo apt-get install imagemagick`)

In a fitting directory (e.g. `/var/www`), clone the project

    git clone https://github.com/igdj/jewish-history-online.git presentation

If you don't have `git` installed, you can also download the project as ZIP-file
and extract it manually.

Change into the newly created project-directory

    cd presentation

Install dependencies

    composer install

Create database

    mysqladmin -u root -p create jgo_presentation

and create a database user with proper rights, e.g.

    mysql -u root -p jgo_presentation

Create a user and grant the needed privileges

    CREATE USER 'jgo_presentation'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';
    GRANT ALL ON jgo_presentation.* TO 'jgo_presentation'@'localhost';

Create your local settings

    cp config/parameters.yml-dist config/parameters.yml

In `config/parameters.yml`, adjust the database settings as by the
database, user and password set above:
    `database.name` / `database.user` / `database.password`)

Make `bin/console` executable

    chmod u+x ./bin/console

Alternatively, you can prepend to `./bin/console` in what follows

    php ./bin/console help

Create the database tables

    ./bin/console doctrine:schema:create

### XSLT-Processor
If you don't have Saxon/C (https://www.saxonica.com/saxon-c/index.xml)
installed as a PHP-module in your web server (which is quite tricky),
you can use the command line adapter.

For this, download `saxon9he.jar` as part of `SaxonHE9-9-1-8J.zip`
(or newer) from
    https://sourceforge.net/projects/saxon/files/Saxon-HE/9.9/
and place it in the `bin/` folder (next to `console`) and make sure
the path to the `java` binary is properly set in the following
line in `parameters.yml`:

    app.xslt.adapter.arguments: "/usr/bin/java -jar %kernel.project_dir%/bin/saxon9he.jar -s:%%source%% -xsl:%%xsl%%  %%additional%%"

On Windows, it might look like

    app.xslt.adapter.arguments: "c:\\Run\\Java\\jdk1.8\\bin\\java -jar %kernel.project_dir%\\bin\\saxon9he.jar -s:%%source%% -xsl:%%xsl%% %%additional%%"

depending on your local Java installation.

### Solr Setup
You can skip this installation in the first step. Everything except the
search field should still work.

First, download

    https://archive.apache.org/dist/lucene/solr/6.2.0/solr-6.2.0.zip

and extract the contents of `solr-6.2.0` into the existing `solr/` folder.

Start solr by

    ./solr/bin/solr start

and then create the `core_de` and `core_de` cores

    ./solr/bin/solr create -c core_de
    ./solr/bin/solr create -c core_en

You can clear the core and re-index existing entities

    ./bin/console solr:index:clear

    ./bin/console solr:index:populate "TeiEditionBundle\\Entity\\Person"
    ./bin/console solr:index:populate "TeiEditionBundle\\Entity\\Organization"
    ./bin/console solr:index:populate "TeiEditionBundle\\Entity\\Place"
    ./bin/console solr:index:populate "TeiEditionBundle\\Entity\\Bibitem"
    ./bin/console solr:index:populate "TeiEditionBundle\\Entity\\Event"
    ./bin/console solr:index:populate "TeiEditionBundle\\Entity\\Article"

For trouble-shooting, you can access the Solr admin interface at

    http://localhost:8983/solr/

To stop it again, call

    ./solr/bin/solr stop -all

### Setup Web-Server
For testing purposes, you can use the built-in server from PHP

    php -S localhost:8000 -t web

And then navigate to http://localhost:8000/app.php/

If you are running on a different host than `localhost`, make sure to adjust

    jms_i18n_routing.hosts.de:  localhost

in `config/parameters.yml` accordingly.

In order to point a proper Web-Server (apache or nginx) to `web`, see
    https://symfony.com/doc/current/setup/web_server_configuration.html for
further detailed instruction.

Make sure to copy `.htaccess.dist` to `.htaccess` if you want to run the site
without prepnding `/app.php/` to every url.

If you get errors due to var not being writable, adjust directory permissions as
described in https://symfony.com/doc/3.4/setup/file_permissions.html
- sudo setfacl -R -m u:www-data:rwX /path/to/var
- sudo setfacl -dR -m u:www-data:rwX /path/to/var

If you get errors due to web/css not being writable, adjust directory permissions as
described in https://symfony.com/doc/3.4/setup/file_permissions.html
- sudo setfacl -R -m u:www-data:rwX /path/to/web/css
- sudo setfacl -dR -m u:www-data:rwX /path/to/web/css

    ./bin/console doctrine:schema:create

Development Notes
-----------------
Translate messages and routes according to settings in
`jms_translation.configs.app`

    ./bin/console translation:extract de --config=app

Site-specific translations (TODO: add --intl-icu as soon as https://github.com/schmittjoh/JMSTranslationBundle/pull/551 is merged)

    ./bin/console translation:extract de --dir=./sites/jgo-presentation/templates --output-dir=./sites/jgo-presentation/translations

Update schema

    ./bin/console doctrine:schema:update --force

License
-------
    Code for the presentation of the Digital Source Edition
        Key Documents of German-Jewish History

    (C) 2017-2023 Institut für die Geschichte der deutschen Juden,
        Daniel Burckhardt


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

Third Party Code
----------------
This projects builds on numerous third-party projects under a variety of
Open Source Licenses. Please check `composer.json` for these dependencies.

The XSLT-Stylesheets are based on the files from
    https://github.com/haoess/dta-tools/tree/master/stylesheets
