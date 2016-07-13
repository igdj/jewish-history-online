Translate routes
./bin/console translation:extract de --dir=./src/ --output-dir=./app/Resources/translations --enable-extractor=jms_i18n_routing

Update schema
 ./bin/console doctrine:schema:update --force
