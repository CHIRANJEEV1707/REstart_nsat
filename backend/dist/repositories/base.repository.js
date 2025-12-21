"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 */
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    /**
     * Find all documents with optional filter
     */
    async findAll(filter = {}, options) {
        return this.model.find(filter, null, options).exec();
    }
    /**
     * Find a single document by ID
     */
    async findById(id) {
        return this.model.findById(id).exec();
    }
    /**
     * Find a single document by filter
     */
    async findOne(filter) {
        return this.model.findOne(filter).exec();
    }
    /**
     * Create a new document
     */
    async create(data) {
        return this.model.create(data);
    }
    /**
     * Update a document by ID
     */
    async updateById(id, update, options) {
        return this.model.findByIdAndUpdate(id, update, { new: true, ...options }).exec();
    }
    /**
     * Delete a document by ID
     */
    async deleteById(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
    /**
     * Count documents matching filter
     */
    async count(filter = {}) {
        return this.model.countDocuments(filter).exec();
    }
    /**
     * Check if document exists
     */
    async exists(filter) {
        const count = await this.model.countDocuments(filter).limit(1).exec();
        return count > 0;
    }
}
exports.BaseRepository = BaseRepository;
