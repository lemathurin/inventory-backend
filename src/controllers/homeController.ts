import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
})

//Fonction de création d'une nouvelle maison (Home) dans la BDD à l'aide de Prisma.
//Avec pour paramètres la requête HTTP (corps + authentification ) et la réponse HTTP
export const createHome = async (req: AuthenticatedRequest, res: Response) => {
  try {
    //Vérifie dans la console le corps de la requête et l'ID de l'utilisateur
    console.log('Received request body:', req.body);
    console.log('User ID from token:', req.user?.userId);

    //On récupère la donnée name du corps de la requête
    const { name, address } = req.body;
    //On stocke l'ID de l'utilisateur dans une constante. 
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    //On appelle la méthode  create  de l'instance  prisma.home en définissant les données à insérer dans la table home.
    const home = await prisma.home.create({
      data: {
        name,
        address,
        users: {
          create: {
            userId: userId,
            admin: true
          }
        }
      },
      //On récupère au passage toutes les utilisation des Users associés à la maison.
      include: {
        users: true
      }
    });
    //On envoie une réponse HTTP avec le statut 201 (Créé), indiquant que la maison a été créée avec succès.
    res.status(201).json({
      message: 'Home created successfully',
      //On retourne un objet contenant l'ID et le nom de la maison
      home: {
        id: home.id,
        name: home.name
      }
    });
  } catch (error) {
    //On enregistre l'erreur dans la console.
    console.error('Error creating home:', error);
    //On vérifie si l'erreur capturée est une instance de Error
    if (error instanceof Error) {
      //Si c'est le cas, on envoie une réponse HTTP avec le statut 500 (Erreur interne du serveur) et un message d'erreur détaillant ce qui s'est mal passé.
      res.status(500).json({ error: 'An error occurred while creating the home', details: error.message });
      //Si l'erreur n'est pas une instance de  Error , on envoie une réponse générique indiquant qu'une erreur inconnue s'est produite.
    } else {
      res.status(500).json({ error: 'An unknown error occurred while creating the home' });
    }
  }
};
//Fonction de récupération de toutes les maisons (Home) à partir de la BDD à l'aide de Prisma.
//Avec pour paramètres la requête HTTP (corps + authentification ) et la réponse HTTP
export const getAllHomes = async (req: Request, res: Response) => {
  try {
    //Récupère toutes les maisons de la BDD grâce à une méthode de Prisma et les stocke dans une constante.
    const homes = await prisma.home.findMany();
    //Stocke les données récupérées dans un tableau d'objets en JSON.
    res.json(homes);
    //Si une erreur se produit lors de la récupération des maisons, 
    //renvoie une réponse avec un statut 500 et un message d'erreur qui indique que la récupération des maisons a échoué.  
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch homes' });
  }
};

//Fonction de récupération d'une maison à partir de son ID dans la BDD. 
export const getHomeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    //Extrait l'ID de la maison à partir des paramètres de la requête. 
    const { id } = req.params;
    //Récupère une maison de la BDD en fonction de son ID, grâce à une méthode de Prisma et les stocke dans une constante.
    const home = await prisma.home.findUnique({
      where: { id: String(id) },
      //Inclut toutes les données des utilisateurs et des objets associés à cette maison.
      include: { users: true, items: true }
    });
    //Si une maison a été trouvée, envoie les données dans une réponse JSON. 
    if (home) {
      res.json(home);
      //Si aucune maison n'est trouvée on envoie un message d'erreur dans le JSON.
    } else {
      res.status(404).json({ error: 'Home not found' });
    }
    //Envoie un message d'erreur si un eerreur se produit dans la fonction. 
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch home' });
  }
};
//Fonction de récupération de l'utilisateur associé à une maison en fonction de son ID. 
export const getUserHomes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    //Récupération de l'ID de l'utilsateur dans la requête. 
    const userId = req.user?.userId;
    //Si l'ID de l'utilisateur est undefined, il n'est donc pas authentifié, on envoie alors un message d'erreur le signalant.
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    //Fonction de récupération de Primsa de toutes les maisons associé à cet utilisateur (il existe au moins un utilisateur dont l'ID correspond)
    const userHomes = await prisma.home.findMany({
      where: {
        users: {
          some: {
            userId: userId
          }
        }
      },
      //On inclut les données des utilisateurs et des objets associés.
      include: {
        users: true,
        items: true
      }
    });
    res.json(userHomes);

  } catch (error) {
    //Si une erreur se produit, on envoie un message dans la console pour le signaler.
    console.error('Error fetching user homes:', error);
    //Si cette erreur est une instance de Error
    if (error instanceof Error) {
      //On envoie une réponse avec le statut 500 (Erreur interne du serveur) et un message d'erreur le signalant.
      res.status(500).json({ error: 'An error occurred while fetching user homes', details: error.message });
      //Si l'erreur n'est pas une instance de  Error, on renvoie un message indiquant qu'une erreur inconnue s'est produite.
    } else {
      res.status(500).json({ error: 'An unknown error occurred while fetching user homes' });
    }
  }
};
