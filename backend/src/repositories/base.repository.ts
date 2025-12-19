import { Model, Document, UpdateQuery, QueryOptions } from 'mongoose';

/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 */
export class BaseRepository<T extends Document> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    /**
     * Find all documents with optional filter
     */
    async findAll(filter: any = {}, options?: QueryOptions): Promise<T[]> {
        return this.model.find(filter, null, options).exec();
    }

    /**
     * Find a single document by ID
     */
    async findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    }

    /**
     * Find a single document by filter
     */
    async findOne(filter: any): Promise<T | null> {
        return this.model.findOne(filter).exec();
    }

    /**
     * Create a new document
     */
    async create(data: any): Promise<any> {
        return this.model.create(data);
    }

    /**
     * Update a document by ID
     */
    async updateById(id: string, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, { new: true, ...options }).exec();
    }

    /**
     * Delete a document by ID
     */
    async deleteById(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
    }

    /**
     * Count documents matching filter
     */
    async count(filter: any = {}): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    /**
     * Check if document exists
     */
    async exists(filter: any): Promise<boolean> {
        const count = await this.model.countDocuments(filter).limit(1).exec();
        return count > 0;
    }
}
