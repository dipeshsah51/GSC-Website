const Project = require("../models/Project");
const {
  isMongoConnected,
  getStoredProjects,
  saveStoredProjects,
  defaultProjects,
} = require("../services/storageService");

// @desc    Get all company projects & portfolio items
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { category, featured, search } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (category && category !== "All") {
        query.category = category;
      }
      if (featured === "true") {
        query.featured = true;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { service: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      let projects = await Project.find(query).sort({ createdAt: -1 });

      // If database is empty, seed defaults
      if (projects.length === 0 && !category && !search) {
        try {
          const seeded = await Project.insertMany(defaultProjects);
          projects = seeded;
        } catch (e) {
          projects = defaultProjects;
        }
      }

      return res.json({
        success: true,
        count: projects.length,
        projects,
      });
    } else {
      let projects = getStoredProjects();

      if (category && category !== "All") {
        projects = projects.filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase() || p.service?.toLowerCase() === category.toLowerCase()
        );
      }
      if (featured === "true") {
        projects = projects.filter((p) => p.featured === true);
      }
      if (search) {
        const s = search.toLowerCase();
        projects = projects.filter(
          (p) =>
            p.title?.toLowerCase().includes(s) ||
            p.location?.toLowerCase().includes(s) ||
            p.service?.toLowerCase().includes(s) ||
            p.description?.toLowerCase().includes(s)
        );
      }

      return res.json({
        success: true,
        count: projects.length,
        projects,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch projects",
    });
  }
};

// @desc    Get project details by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
      return res.json({ success: true, project });
    } else {
      const projects = getStoredProjects();
      const project = projects.find((p) => p._id === id);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
      return res.json({ success: true, project });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch project details",
    });
  }
};

// @desc    Create a new project portfolio item
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res) => {
  try {
    const {
      title,
      category,
      service,
      location,
      client,
      year,
      imageUrl,
      description,
      scope,
      stats,
      featured,
    } = req.body;

    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    if (!title || !category || !service || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, Category, Service division, and Description are required",
      });
    }

    const projectData = {
      title: title.trim(),
      category: category.trim(),
      service: service.trim(),
      location: (location || "Doha, Qatar").trim(),
      client: (client || "Client Confidential").trim(),
      year: year || new Date().getFullYear().toString(),
      imageUrl: finalImageUrl || "/src/assets/services/general-construction.jpg",
      description: description.trim(),
      scope: Array.isArray(scope) ? scope : typeof scope === "string" ? scope.split(",").map(s => s.trim()) : [],
      stats: (stats || "Completed On Schedule").trim(),
      featured: featured === true || featured === "true",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      const created = await Project.create(projectData);
      return res.status(201).json({
        success: true,
        message: "Project added to portfolio successfully",
        project: created,
      });
    } else {
      const projects = getStoredProjects();
      const newProject = { _id: `proj_${Date.now()}`, ...projectData };
      projects.unshift(newProject);
      saveStoredProjects(projects);

      return res.status(201).json({
        success: true,
        message: "Project added to portfolio successfully",
        project: newProject,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create project",
    });
  }
};

// @desc    Update an existing project
// @route   PATCH /api/projects/:id
// @access  Private (Admin)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (typeof updateData.scope === "string") {
      updateData.scope = updateData.scope.split(",").map((s) => s.trim());
    }

    if (isMongoConnected()) {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      Object.assign(project, updateData);
      const updated = await project.save();
      return res.json({
        success: true,
        message: "Project updated successfully",
        project: updated,
      });
    } else {
      const projects = getStoredProjects();
      const index = projects.findIndex((p) => p._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      projects[index] = { ...projects[index], ...updateData, updatedAt: new Date().toISOString() };
      saveStoredProjects(projects);

      return res.json({
        success: true,
        message: "Project updated successfully",
        project: projects[index],
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update project",
    });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
      await project.deleteOne();
      return res.json({ success: true, message: "Project deleted successfully" });
    } else {
      const projects = getStoredProjects();
      const filtered = projects.filter((p) => p._id !== id);
      saveStoredProjects(filtered);
      return res.json({ success: true, message: "Project deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete project",
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
