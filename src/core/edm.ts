import { create } from 'xmlbuilder2';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

export type PrimitiveTypes = 'Edm.Binary' | 'Edm.Boolean' | 'Edm.Byte' | 'Edm.Date' | 'Edm.DateTimeOffset' | 'Edm.Decimal' | 'Edm.Double' | 'Edm.Duration' | 'Edm.Guid' | 'Edm.Int16' | 'Edm.Int32' | 'Edm.Int64' | 'Edm.SByte' | 'Edm.Single' | 'Edm.Stream' | 'Edm.String' | 'Edm.TimeOfDay' | 'Edm.Geography' | 'Edm.GeographyPoint' | 'Edm.GeographyLineString' | 'Edm.GeographyPolygon' | 'Edm.GeographyMultiPoint' | 'Edm.GeographyMultiLineString' | 'Edm.GeographyMultiPolygon' | 'Edm.GeographyCollection' | 'Edm.Geometry' | 'Edm.GeometryPoint' | 'Edm.GeometryLineString' | 'Edm.GeometryPolygon' | 'Edm.GeometryMultiPoint' | 'Edm.GeometryMultiLineString' | 'Edm.GeometryMultiPolygon' | 'Edm.GeometryCollection';
export type OnDeleteActionType = 'Cascade' | 'None' | 'SetNull' | 'SetDefault';

export class Edm {

    private readonly edmxNS: string = "http://docs.oasis-open.org/odata/ns/edmx";
    private readonly edmNS: string = "http://docs.oasis-open.org/odata/ns/edm";

    private readonly edmDocument: XMLBuilder;

    constructor() {
        this.edmDocument = create({ namespaceAlias: { edmx: this.edmxNS, edm: this.edmNS } });
        this.addEdmRootNodes();
    }

    public getEdmDocument(prettyPrint: boolean = false) {
        // TODO: CSDL REfrence 
        /**
         * CSDL REfrence test
         * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_IncludedSchema
         * 
         *  PENDING :=> 4.3
         */
        // this.addCSDLReference({ uri: "http://vocabs.odata.org/capabilities/v1", includeSchema: [{ namespace: "Org.OData.Capabilities.V1" }] })
        // this.addCSDLReference({ uri: "http://vocabs.odata.org/capabilities/v2", includeSchema: [{ namespace: "Org.OData.Capabilities.V2", alias: "UI"}] })
        // End

        // TODO: Schema
        /**
         * Schema test
         * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_Schema
         * 
         */
        // this.addSchema({namespace: "Corvus.Application"});
        this.addSchema({ namespace: "Corvus.Data.App", alias: "App" });
        // End

        // TODO: EntityType
        /**
         * Schema test
         * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_Schema
         * 
         */
        this.addEntityType("Corvus.Data.App", {
            name: "Product", properties: [
                { name: 'ProductId', type: 'Edm.Int32', isKey: true, nullable: false },
                { name: 'ProductName', type: 'Edm.String' },
                { name: 'SupplierID', type: 'Edm.Int32' },
                { name: 'CategoryID', type: 'Edm.Int32' },
                { name: 'QuantityPerUnit', type: 'Edm.String' },
                { name: 'UnitPrice', type: 'Edm.Decimal' },
                { name: 'UnitsInStock', type: 'Edm.Int16' },
                { name: 'UnitsOnOrder', type: 'Edm.Int16' },
                { name: 'ReorderLevel', type: 'Edm.Int16' },
                { name: 'Discontinued', type: 'Edm.Boolean', nullable: false }
            ]
        });
        this.addEntityType("Corvus.Data.App", {
            name: "Category", properties: [
                { name: 'CategoryID', type: 'Edm.Int32', isKey: true, nullable: false },
                { name: 'CategoryName', type: 'Edm.String', nullable: false },
                { name: 'Description', type: 'Edm.String' },
                { name: 'Picture', type: 'Edm.Binary' }
                
            ],
            
        });
        // End

        this.addBiDirectionalNavigation({
            sourceEntityType: "App.Category",
            targateEntityType: "App.Product",
            forwordNavigation: {
                name: 'Products',
                multiplicity: 'Many',
            },
            backwordNavigation: {
                name: 'Category',
                multiplicity: 'ZeroOrOne',
                property: 'CategoryID',
                referencedProperty: 'ProductId'
            }
        });
        return this.edmDocument.end({ prettyPrint: prettyPrint });
    }

    public addCSDLReference(ref: { uri: string, includeSchema: { namespace: string, alias?: string }[] }) {
        var referenceNodePointer = this.edmDocument.root().ele("@edmx", "Reference").att("Uri", ref.uri);
        if (ref.includeSchema && (Array.isArray(ref.includeSchema))) {
            ref.includeSchema.forEach(element => {
                let includeNodePointer = referenceNodePointer.ele("@edmx", "Include").att("Namespace", element.namespace);
                if (element.alias) {
                    includeNodePointer.att("Alias", element.alias);
                }
            });
        }
    }

    public addSchema(schema: { namespace: string, alias?: string }) {
        let dataServicePointer = this.edmDocument.root().first();
        let schemaPointer = dataServicePointer.ele(this.edmNS, "Schema").att("Namespace", schema.namespace);
        if (schema.alias) {
            schemaPointer.att("Alias", schema.alias);
        }
    }

    public addEntityType(schema: string, entityType: {
        name: string,
        baseType?: string,
        abstract?: boolean,
        open?: boolean,
        hasStream?: boolean,

        properties?: {
            name: string,
            type: PrimitiveTypes,
            collection?: boolean,
            nullable?: boolean,
            maxLength?: number,
            precision?: number,
            scale?: number,
            unicode?: boolean,
            srid?: string | number,
            defaultValue?: any,
            isKey?: boolean;
            keyAlias?: string;
            keyName?: string;
        }[]
    }) {

        // root -> DataService(First()) -> schemas []
        let schemaPointer = this.findElementByAttribute(this.edmDocument.root().first(), 'Namespace', schema);

        if (!schemaPointer) {
            throw `Schema '${schema}' not found.`;
        }
        let entityPointer = schemaPointer.ele("@edm", "EntityType",
            {
                Name: entityType.name,
                BaseType: entityType.baseType,
                Abstract: entityType.abstract,
                OpenType: entityType.open,
                HasStream: entityType.hasStream
            });
        let keyPointer = entityPointer.ele("@edm", 'Key');

        // Add properties
        if (entityType.properties) {
            entityType.properties.forEach(p => {
                entityPointer.ele("@edm", "Property",
                    {
                        Name: p.name,
                        Type: p.collection ? `Collection(${p.type})` : p.type,
                        Nullable: p.nullable,
                        MaxLength: p.maxLength,
                        Precision: p.precision,
                        Scale: p.scale,
                        Unicode: p.unicode,
                        SRID: p.srid,
                        DefaultValue: p.defaultValue
                    });
                if (p.isKey) {
                    keyPointer.ele('@edm', 'PropertyRef',
                        {
                            Name: p.keyName || p.name,
                            Alias: p.keyAlias
                        });
                }
            });
        }
    }

    public addBiDirectionalNavigation(navigation: {
        sourceEntityType: string,
        targateEntityType: string,
        forwordNavigation: {
            property?: string;
            referencedProperty?: string;
            multiplicity: 'Unknown' | 'ZeroOrOne' | 'One' | 'Many',
            name: string,
            onDelete?: OnDeleteActionType
        },
        backwordNavigation: {
            property?: string;
            referencedProperty?: string;
            multiplicity: 'Unknown' | 'ZeroOrOne' | 'One' | 'Many',
            name: string,
            onDelete?: OnDeleteActionType
        }
    }) {

        // root -> DataService(First()) -> schemas []
        let sourceSchemaPointer = this.findSchemaByEntityFullName(navigation.sourceEntityType);

        let sourceEntityTypePointer = this.findElementByAttribute(sourceSchemaPointer, 'Name', this.getEntityNameFromFullName(navigation.sourceEntityType));
        if (!sourceEntityTypePointer) {
            throw `EntityType '${navigation.sourceEntityType}' not found in schema '${sourceSchemaPointer.node.nodeName}'.`;
        }
        let targateSchemaPointer = this.findSchemaByEntityFullName(navigation.targateEntityType);
        let targateEntityTypePointer = this.findElementByAttribute(targateSchemaPointer, 'Name', this.getEntityNameFromFullName(navigation.targateEntityType));
        if (!targateEntityTypePointer) {
            throw `EntityType '${navigation.targateEntityType}' not found in schema '${sourceSchemaPointer.node.nodeName}'.`;
        }

        this.addNavigationLink(sourceEntityTypePointer, Object.assign({ type: navigation.targateEntityType, partner: navigation.backwordNavigation.name }, navigation.forwordNavigation));
        this.addNavigationLink(targateEntityTypePointer, Object.assign({ type: navigation.sourceEntityType, partner: navigation.forwordNavigation.name }, navigation.backwordNavigation));

    }

    private addNavigationLink(entityTypePointer: XMLBuilder, nav: {
        type: string;
        partner?: string;
        property?: string;
        referencedProperty?: string;
        multiplicity: 'Unknown' | 'ZeroOrOne' | 'One' | 'Many',
        name: string,
        onDelete?: OnDeleteActionType
    }) {
        let srcNavigationPointer = entityTypePointer.ele("@edm", 'NavigationProperty',
            {
                Name: nav.name,
                Type: nav.multiplicity === 'Many' ? `Collection(${nav.type})` : nav.type,
                Nullable: nav.multiplicity === 'One' ? false : null, // null means true in EDM defination for this property
                Partner: nav.partner,
                // TODO: Implement this feature of defination 
                // http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_ContainmentNavigationProperty
                // ContainsTarget: navigation.forwordNavigation.
            });

        if (nav.multiplicity !== 'Many') {
            srcNavigationPointer.ele('@edm', 'ReferentialConstraint',
                {
                    Property: nav.property,
                    ReferencedProperty: nav.referencedProperty
                });
        }
    }

    private addEdmRootNodes() {
        this.edmDocument.ele("@edmx", "edmx:Edmx")
            .att("Version", "4.01")
            .ele("@edmx", "DataServices");
    }

    private findEntityTypeByFullName(entitytypeName: string): XMLBuilder {
        let nameComponents = entitytypeName.trim().split('.');
        if (nameComponents.length < 2) throw 'Invalid entity name. It should be Full name of entity with namespace.';
        let entityTypeName = nameComponents[nameComponents.length - 1];
        let schemaNameOrAlias = nameComponents.slice(0, nameComponents.length - 1).join('.');

        let schemaPointer = this.findElementByAttribute(this.edmDocument.root().first(), 'Namespace', schemaNameOrAlias);

        // Alias can't be a qualifiedname so only search in alias if it is a simpleidentifer
        if (!schemaPointer && this.isSimpleIdentifier(schemaNameOrAlias)) {
            schemaPointer = this.findElementByAttribute(this.edmDocument.root().first(), 'Alias', schemaNameOrAlias);
        }

        if (!schemaPointer) {
            throw `Schema '${schemaNameOrAlias}' not found.`;
        }

        let sourceEntityTypePointer = this.findElementByAttribute(schemaPointer, 'Name', entityTypeName);
        if (!sourceEntityTypePointer) {
            throw `EntityType '${entityTypeName}' not found in schema '${schemaNameOrAlias}'.`;
        }

        return sourceEntityTypePointer;
    }

    private findSchemaByEntityFullName(entitytypeName: string): XMLBuilder {
        let nameComponents = entitytypeName.trim().split('.');
        if (nameComponents.length < 2) throw 'Invalid entity name. It should be Full name of entity with namespace.';
        let schemaNameOrAlias = nameComponents.slice(0, nameComponents.length - 1).join('.');

        let schemaPointer = this.findElementByAttribute(this.edmDocument.root().first(), 'Namespace', schemaNameOrAlias);

        // Alias can't be a qualifiedname so only search in alias if it is a simpleidentifer
        if (!schemaPointer && this.isSimpleIdentifier(schemaNameOrAlias)) {
            schemaPointer = this.findElementByAttribute(this.edmDocument.root().first(), 'Alias', schemaNameOrAlias);
        }

        if (!schemaPointer) {
            throw `Schema '${schemaNameOrAlias}' not found.`;
        }

        return schemaPointer;
    }

    private findElementByAttribute(parentNode: XMLBuilder, attribute: string, value: string): XMLBuilder {
        let data = parentNode.filter((el: XMLBuilder, index: number, level: number) => {
            let node = el.node as any as Element;
            return node.hasAttribute(attribute) && node.getAttribute(attribute) == value;
        }, false, false);

        if (data.length > 0) {
            return data[0];
        }
        else {
            return undefined;
        }
    }

    /**
     * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_SimpleIdentifier
     */
    private isSimpleIdentifier(name: string) {
        let simpleIdentifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]{0,127}$/g;
        return simpleIdentifierPattern.test(name);
    }

    private getEntityNameFromFullName(entityFullName: string)
    {
        let nameComponents = entityFullName.trim().split('.');
        if (nameComponents.length < 2) throw 'Invalid entity name. It should be Full name of entity with namespace.';
        return nameComponents[nameComponents.length - 1];
    }
}