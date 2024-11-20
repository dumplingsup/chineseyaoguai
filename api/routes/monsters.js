import express from 'express';
import Monster from '../models/Monster.js';

const router = express.Router();

// 获取妖怪列表
router.get('/', async (req, res) => {
  try {
    const { type, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [monsters, total] = await Promise.all([
      Monster.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean()
        .maxTimeMS(30000), // 设置查询超时时间为30秒
      Monster.countDocuments(query)
        .maxTimeMS(30000) // 设置查询超时时间为30秒
    ]);

    res.json({
      monsters,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching monsters:', error);
    res.status(500).json({ 
      message: '获取数据失败',
      error: error.message 
    });
  }
});

// 获取单个妖怪
router.get('/:id', async (req, res) => {
  try {
    const monster = await Monster.findById(req.params.id)
      .lean()
      .maxTimeMS(30000); // 设置查询超时时间为30秒
    
    if (!monster) {
      return res.status(404).json({ message: '妖怪不存在' });
    }
    res.json(monster);
  } catch (error) {
    console.error('Error fetching monster:', error);
    res.status(500).json({ 
      message: '获取数据失败',
      error: error.message 
    });
  }
});

// 创建新妖怪
router.post('/', async (req, res) => {
  try {
    const monster = new Monster(req.body);
    const newMonster = await monster.save();
    res.status(201).json(newMonster);
  } catch (error) {
    console.error('Error creating monster:', error);
    res.status(400).json({ 
      message: '创建失败',
      error: error.message 
    });
  }
});

// 更新妖怪
router.put('/:id', async (req, res) => {
  try {
    const monster = await Monster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true,
        maxTimeMS: 30000 // 设置查询超时时间为30秒
      }
    );
    if (!monster) {
      return res.status(404).json({ message: '妖怪不存在' });
    }
    res.json(monster);
  } catch (error) {
    console.error('Error updating monster:', error);
    res.status(400).json({ 
      message: '更新失败',
      error: error.message 
    });
  }
});

// 删除妖怪
router.delete('/:id', async (req, res) => {
  try {
    const monster = await Monster.findByIdAndDelete(req.params.id)
      .maxTimeMS(30000); // 设置查询超时时间为30秒
    
    if (!monster) {
      return res.status(404).json({ message: '妖怪不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Error deleting monster:', error);
    res.status(500).json({ 
      message: '删除失败',
      error: error.message 
    });
  }
});

export default router;