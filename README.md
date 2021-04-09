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
Install dependencies

    composer install

Create database

    mysqladmin -u root -p create jgo_presentation

and create a database user with proper rights

Adjust local settings

    cp config/parameters.yaml-dist config/parameters.yaml

In `config/parameters.yaml`, adjust the database settings
(database.name / database.user / database.password)

Create the tables

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

    (C) 2017-2021 Institut für die Geschichte der deutschen Juden,
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
