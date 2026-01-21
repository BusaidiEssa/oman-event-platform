import Event from '../models/Event.js'; // Import the Event model to interact with the database

// Controller to handle event creation
export const createEvent = async (req, res) => {
  try {
    const { title, date, location, description } = req.body; // Extract data from request body
    
    // Generate slug from event title
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove any special characters
      .replace(/\s+/g, '-')         // Replace spaces with dashes
      .substring(0, 50);            // Restrict slug length to the first 50 characters

    let slug = baseSlug; // Start with the base slug
    let counter = 1;     // Initialize a counter for ensuring uniqueness
    // Check the database to ensure the slug is unique
    while (await Event.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`; // Append a counter to create a unique slug
      counter++;
    }

    // Create a new Event instance and populate its details
    const event = new Event({
      title,          
      slug,           
      date,           
      location,       
      description,    
      groups: [],     
      managerId: req.managerId // Associate the event with the current manager, pulled from JWT payload
    });
    // Save the event to the database
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//retreive events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ managerId: req.managerId })
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//retrieve event by id or slug if id fails
export const getEventById = async (req, res) => {
  try {
    const identifier = req.params.id || req.params.slug;
    
    // Try to find by ID first, then by slug
    let event = await Event.findOne({ 
      _id: identifier, 
      managerId: req.managerId 
    });
    
    if (!event) {
      // Try finding by slug
      event = await Event.findOne({ 
        slug: identifier, 
        managerId: req.managerId 
      });
    }
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    // If error is due to invalid ObjectId, try slug
    if (error.name === 'CastError') {
      try {
        const event = await Event.findOne({ 
          slug: req.params.id || req.params.slug, 
          managerId: req.managerId 
        });
        
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
        return res.json(event);
      } catch (slugError) {
        return res.status(500).json({ message: slugError.message });
      }
    }
    res.status(500).json({ message: error.message });
  }
};
// retrieve event by slug
export const getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, date, location, description } = req.body;
    
    const event = await Event.findOne({
      _id: req.params.id,
      managerId: req.managerId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update slug if title changed
    if (title && title !== event.title) {
      const baseSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      let slug = baseSlug;
      let counter = 1;
      while (await Event.findOne({ slug, _id: { $ne: event._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      event.slug = slug;
      event.title = title;
    }

    if (date) event.date = date;
    if (location !== undefined) event.location = location;
    if (description !== undefined) event.description = description;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// handles delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      managerId: req.managerId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stakeholder group management with auto-initialization of name and email
export const addStakeholderGroup = async (req, res) => {
  try {
    const { name, capacity, fields } = req.body;
    
    const event = await Event.findOne({
      _id: req.params.id,
      managerId: req.managerId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    //  always initiliaze group form with mandotary Name and Email fields
    let initializedFields = fields || [];
    
    // Check if Name field exists
    const hasName = initializedFields.some(f => 
      f.label.toLowerCase().includes('name') || f.label.toLowerCase().includes('اسم')
    );
    
    // Check if Email field exists
    const hasEmail = initializedFields.some(f => 
      f.label.toLowerCase().includes('email') || f.label.toLowerCase().includes('بريد')
    );

    // Add Name field at the beginning if missing
    if (!hasName) {
      initializedFields.unshift({
        label: 'Full Name',
        type: 'text',
        required: true
      });
    }

    // Add Email field after Name if missing
    if (!hasEmail) {
      const insertIndex = hasName ? 1 : 1; // After Name field
      initializedFields.splice(insertIndex, 0, {
        label: 'Email',
        type: 'text',
        required: true
      });
    }

    // Ensure Name and Email fields are always required
    initializedFields = initializedFields.map(field => {
      const isNameField = field.label.toLowerCase().includes('name') || field.label.toLowerCase().includes('اسم');
      const isEmailField = field.label.toLowerCase().includes('email') || field.label.toLowerCase().includes('بريد');
      
      if (isNameField || isEmailField) {
        return { ...field, required: true };
      }
      return field;
    });

    event.groups.push({
      name,
      capacity,
      isOpen: true,
      fields: initializedFields
    });

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//handle update to form
export const updateStakeholderGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, capacity, fields, isOpen } = req.body;

    const event = await Event.findOne({
      _id: req.params.id,
      managerId: req.managerId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const group = event.groups.id(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Stakeholder group not found' });
    }

    if (fields) {
      // Validate that Name and Email fields exist and are required
      const hasName = fields.some(f => 
        (f.label.toLowerCase().includes('name') || f.label.toLowerCase().includes('اسم')) && f.required
      );
      const hasEmail = fields.some(f => 
        (f.label.toLowerCase().includes('email') || f.label.toLowerCase().includes('بريد')) && f.required
      );

      if (!hasName || !hasEmail) {
        return res.status(400).json({ 
          message: 'Stakeholder form must include required Name and Email fields' 
        });
      }
      
      group.fields = fields;
    }

    if (name !== undefined) group.name = name;
    if (capacity !== undefined) group.capacity = capacity;
    if (isOpen !== undefined) group.isOpen = isOpen;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//handle closing and opening the form registration link
export const toggleStakeholderForm = async (req, res) => {
  try {
    const { groupId } = req.params;

    const event = await Event.findOne({
      _id: req.params.id,
      managerId: req.managerId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const group = event.groups.id(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Stakeholder group not found' });
    }

    group.isOpen = !group.isOpen;
    await event.save();
    
    res.json({ 
      message: `Registration form ${group.isOpen ? 'opened' : 'closed'}`,
      isOpen: group.isOpen,
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// handle deletion of stakeholderGroup
export const deleteStakeholderGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const event = await Event.findOne({
      _id: req.params.id,
      managerId: req.managerId
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.groups.pull(groupId);
    await event.save();
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
