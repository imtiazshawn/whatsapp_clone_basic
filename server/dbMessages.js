import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestapms: String,
    received: Boolean
});

export default mongoose.model('messagecontents', whatsappSchema);