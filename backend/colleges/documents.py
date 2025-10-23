"""
Elasticsearch document definitions for colleges app.
"""
from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import College


@registry.register_document
class CollegeDocument(Document):
    """
    Elasticsearch document for College model.
    This enables fast full-text search and filtering for college discovery.
    """
    
    # Basic fields
    id = fields.IntegerField(attr='id')
    name = fields.TextField(
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
        }
    )
    description = fields.TextField()
    
    # Location fields
    state = fields.KeywordField()
    city = fields.KeywordField()
    location = fields.GeoPointField(attr='location_field_indexing')
    
    # Type and accreditation
    type = fields.KeywordField()
    accreditation = fields.KeywordField(multi=True)
    
    # Fees
    fees_annual = fields.IntegerField()
    fees_hostel = fields.IntegerField()
    
    # Scores and ratings
    restart_score = fields.IntegerField()
    ratings_count = fields.IntegerField()
    reviews_avg = fields.FloatField()
    
    # Status
    status = fields.KeywordField()
    
    # Related data
    exams_required = fields.KeywordField(
        attr='exams_required_indexing',
        multi=True
    )
    degrees_offered = fields.KeywordField(
        attr='degrees_offered_indexing',
        multi=True
    )
    
    # Timestamps
    created_at = fields.DateField()
    updated_at = fields.DateField()
    
    class Index:
        # Name of the Elasticsearch index
        name = 'colleges'
        # Index settings
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 1,
            'analysis': {
                'analyzer': {
                    'college_analyzer': {
                        'type': 'custom',
                        'tokenizer': 'standard',
                        'filter': ['lowercase', 'asciifolding']
                    }
                }
            }
        }
    
    class Django:
        model = College
        # Fields to index
        fields = [
            'website_url',
        ]
        # Ignore auto updating of Elasticsearch when a model is saved/deleted
        ignore_signals = False
        # Auto refresh index after every update
        auto_refresh = True
    
    def prepare_location_field_indexing(self, instance):
        """Prepare location data for geo_point field"""
        if instance.location_lat and instance.location_lng:
            return {
                'lat': float(instance.location_lat),
                'lon': float(instance.location_lng)
            }
        return None
    
    def prepare_exams_required_indexing(self, instance):
        """Get list of exam codes required by this college"""
        return [exam.code for exam in instance.exams_required.all()]
    
    def prepare_degrees_offered_indexing(self, instance):
        """Get list of degree names offered by this college"""
        return [cd.degree.name for cd in instance.degrees.all()]
