import mongoose from 'mongoose';

const monsterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true // 添加索引以提高查询性能
  },
  type: {
    type: String,
    required: true,
    enum: ['统领', '妖', '精', '鬼', '怪'],
    index: true // 添加索引以提高查询性能
  },
  imageUrl: {
    type: String,
    required: true
  },
  appearance: {
    type: String,
    required: true
  },
  distribution: {
    type: String,
    required: true
  },
  abilities: [{
    type: String
  }],
  description: {
    type: String,
    required: true
  },
  sources: [{
    book: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  location: {
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true,
  collection: 'monsters' // 显式指定集合名称
});

// 添加复合索引以支持搜索
monsterSchema.index({ 
  name: 'text', 
  description: 'text' 
});

// 添加错误处理中间件
monsterSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('妖怪名称已存在'));
  } else {
    next(error);
  }
});

const Monster = mongoose.model('Monster', monsterSchema);

// 确保索引存在
Monster.createIndexes().catch(error => {
  console.error('Error creating indexes:', error);
});

export default Monster;