/*
  This is a basic skeleton JavaScript update processor.

  In order for this to be executed, it must be properly wired into solrconfig.xml; by default it is commented out in
  the example solrconfig.xml and must be uncommented to be enabled.

  See http://wiki.apache.org/solr/ScriptUpdateProcessor for more details.
*/

// Get a configuration parameter:
//  config_param = params.get('config_param');  // "params" only exists if processor configured with <lst name="params">

// Get a request parameter:
// some_param = req.getParams().get("some_param")

// Add a field of field names that match a pattern:
//   - Potentially useful to determine the fields/attributes represented in a result set, via faceting on field_name_ss
//  field_names = doc.getFieldNames().toArray();
//  for(i=0; i < field_names.length; i++) {
//    field_name = field_names[i];
//    if (/attr_.*/.test(field_name)) { doc.addField("attribute_ss", field_names[i]); }
//  }

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function processAdd(cmd) {
    doc = cmd.solrDoc;  // org.apache.solr.common.SolrInputDocument
    id = doc.getFieldValue("id");
    logger.info("update-script#processAdd: id=" + id);

    // Set a field value:
    var entity = id.replace(/_.+/, '');
    doc.setField("entity_s", entity);

    var name_order = doc.getFieldValue("name_s");

    if ('person' == entity) {
        var nameParts = [];
        if (!isEmpty(doc.getFieldValue("family_name_s"))) {
            nameParts.push(doc.getFieldValue("family_name_s"));
        }
        if (!isEmpty(doc.getFieldValue("given_name_s"))) {
            nameParts.push(doc.getFieldValue("given_name_s"));
        }
        name_order = nameParts.join(', ');

        // for suggest
        doc.setField("name_s", nameParts.reverse().join(' '));

        var description = doc.getFieldValues("description_ss");
        if (description != null && description.length > 0) {
            doc.setField("description_s", description[0]);
        }
        doc.removeField("description_ss");
    }
    else if ('place' == entity || 'organization' == entity) {
        var alternateName = doc.getFieldValues("alternate_name_ss");
        if (alternateName != null && alternateName.length > 0 && !isEmpty(alternateName[0])) {
            doc.setField("name_s", name_order = alternateName[0]);
        }
        doc.removeField("alternate_name_ss");
    }
    else if ('bibitem' == entity) {
        var description = doc.getFieldValues("description_ss");
        if (description != null && description.length > 0 && !isEmpty(description[0])) {
            doc.setField("description_s", "");
            doc.setField("additional_s", description[0]);
        }
        doc.removeField("description_ss");
    }

    doc.setField("name_order_s", name_order);
}

function processDelete(cmd) {
    // no-op
}

function processMergeIndexes(cmd) {
    // no-op
}

function processCommit(cmd) {
    // no-op
}

function processRollback(cmd) {
    // no-op
}

function finish() {
    // no-op
}
