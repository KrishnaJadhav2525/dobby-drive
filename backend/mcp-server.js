require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Folder = require('./models/Folder');
const Image = require('./models/Image');
const User = require('./models/User');

const server = new Server({
  name: 'dobby-drive-server',
  version: '1.0.0',
});

// User context to track authenticated user
let currentUser = null;

server.setRequestHandler('initialize', async () => {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.error('Connected to MongoDB');

  return {
    protocolVersion: '2024-11-05',
    capabilities: {},
    serverInfo: {
      name: 'Dobby Drive MCP Server',
      version: '1.0.0',
    },
  };
});

// Tool: Create a folder
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'create_folder') {
    const { folderName, parentFolderId, authToken } = args;

    // Authenticate
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      currentUser = decoded.id;
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Authentication failed: ${error.message}` }],
        isError: true,
      };
    }

    try {
      // Verify parent folder exists if provided
      if (parentFolderId) {
        const parent = await Folder.findOne({ _id: parentFolderId, owner: currentUser });
        if (!parent) {
          return {
            content: [{ type: 'text', text: 'Parent folder not found' }],
            isError: true,
          };
        }
      }

      const folder = await Folder.create({
        name: folderName,
        parent: parentFolderId || null,
        owner: currentUser,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Folder created successfully: ${folder.name} (ID: ${folder._id})`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error creating folder: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === 'upload_image') {
    const { imageName, imageUrl, folderId, authToken } = args;

    // Authenticate
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      currentUser = decoded.id;
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Authentication failed: ${error.message}` }],
        isError: true,
      };
    }

    try {
      const folder = await Folder.findOne({ _id: folderId, owner: currentUser });
      if (!folder) {
        return {
          content: [{ type: 'text', text: 'Folder not found' }],
          isError: true,
        };
      }

      // Note: In a real implementation, you'd download the image from imageUrl
      // For now, we'll just create a reference
      const image = await Image.create({
        name: imageName,
        filename: `uploaded-${Date.now()}.jpg`,
        originalname: imageName,
        mimetype: 'image/jpeg',
        size: 0,
        folder: folderId,
        owner: currentUser,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Image created successfully: ${image.name} (ID: ${image._id})`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error uploading image: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === 'list_folders') {
    const { authToken, parentFolderId } = args;

    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      currentUser = decoded.id;
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Authentication failed: ${error.message}` }],
        isError: true,
      };
    }

    try {
      const query = { owner: currentUser };
      if (parentFolderId) {
        query.parent = parentFolderId;
      } else {
        query.parent = null;
      }

      const folders = await Folder.find(query).sort({ createdAt: -1 });
      const folderList = folders
        .map((f) => `- ${f.name} (ID: ${f._id})`)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: folderList || 'No folders found',
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error listing folders: ${error.message}` }],
        isError: true,
      };
    }
  }

  return {
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'create_folder',
        description: 'Create a new folder in Dobby Drive',
        inputSchema: {
          type: 'object',
          properties: {
            folderName: {
              type: 'string',
              description: 'The name of the folder to create',
            },
            parentFolderId: {
              type: 'string',
              description: 'The ID of the parent folder (optional)',
            },
            authToken: {
              type: 'string',
              description: 'JWT authentication token',
            },
          },
          required: ['folderName', 'authToken'],
        },
      },
      {
        name: 'upload_image',
        description: 'Upload an image to a folder in Dobby Drive',
        inputSchema: {
          type: 'object',
          properties: {
            imageName: {
              type: 'string',
              description: 'The name of the image',
            },
            imageUrl: {
              type: 'string',
              description: 'The URL of the image to upload',
            },
            folderId: {
              type: 'string',
              description: 'The ID of the folder to upload to',
            },
            authToken: {
              type: 'string',
              description: 'JWT authentication token',
            },
          },
          required: ['imageName', 'imageUrl', 'folderId', 'authToken'],
        },
      },
      {
        name: 'list_folders',
        description: 'List all folders in a specific location',
        inputSchema: {
          type: 'object',
          properties: {
            parentFolderId: {
              type: 'string',
              description: 'The ID of the parent folder (optional, omit for root)',
            },
            authToken: {
              type: 'string',
              description: 'JWT authentication token',
            },
          },
          required: ['authToken'],
        },
      },
    ],
  };
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

console.error('Dobby Drive MCP Server started');
