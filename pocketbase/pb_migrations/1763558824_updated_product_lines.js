/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_124373691")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "bool1821142673",
    "name": "is_visible",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_124373691")

  // remove field
  collection.fields.removeById("bool1821142673")

  return app.save(collection)
})
