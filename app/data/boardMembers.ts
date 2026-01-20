export interface BoardMember {
  name: string
  title?: string
  organization: string
  position?: string
  years?: string
}

export const boardMembers = {
  officers: [
    {
      position: 'Chair',
      name: 'Jason Woods',
      title: 'Flash Gordon Parks',
      organization: 'Mo Better Brews'
    },
    {
      position: 'Vice-Chair',
      name: 'Marissa Saenz',
      organization: 'Rukaz Kultura'
    },
    {
      position: 'Secretary/Founder',
      name: 'Gracie Chávez',
      organization: 'Bombón Texas'
    },
    {
      position: 'Treasurer',
      name: 'Dria Thornton',
      organization: 'FrontRunnaz Ent.'
    }
  ] as BoardMember[],
  
  members: [
    {
      name: 'Ericka de Leon',
      organization: 'Hip Hop Vintage Flea Market, Bgirl City'
    },
    {
      name: 'Tracy DeJarnett',
      organization: 'Houston Live, SongFest'
    },
    {
      name: 'Henry Guidry',
      organization: 'SwishaHouse'
    },
    {
      name: 'Jagi Kaital',
      organization: 'White Oak Music Hall'
    },
    {
      name: '(Vacant)',
      organization: ''
    }
  ] as BoardMember[],
  
  alternates: [
    {
      name: 'Michael (Frost) Moore',
      organization: ''
    },
    {
      name: 'Lupe Olivares',
      organization: ''
    },
    {
      name: '(Vacant)',
      organization: ''
    }
  ] as BoardMember[],
  
  alumni: [
    {
      name: 'Mark Austin',
      years: '2022-2025',
      position: 'Vice-Chair',
      organization: 'Houston Music Foundation'
    },
    {
      name: 'Jason Kane',
      organization: 'Houston Livestock Show & Rodeo'
    },
    {
      name: 'Anna Garza',
      years: '2022-2025',
      organization: 'Girls Rock Camp Houston'
    },
    {
      name: 'Dr. Anne Lundy',
      years: '2022-2023',
      organization: 'Community Music Center of Houston, Scott Joplin Houston Orchestra'
    },
    {
      name: 'Eric Jimenez',
      years: '2022-2023',
      position: 'Board Secretary',
      organization: 'Prairie View A&M University'
    }
  ] as BoardMember[]
}

export const musicOfficer = {
  name: 'Gracie Chavez',
  title: 'Music + Cultural Tourism Officer',
  department: "Mayor's Office of Cultural Affairs (MOCA)",
  bio: `To achieve this work of advancing Houston's music industry and support cultural tourism, established musician and community advocate Gracie Chavez joined MOCA as the City's founding Music + Cultural Tourism Officer in 2022.

That same year, she devised the concept of a music board and drafted the city ordinance to establish Houston's Music Advisory Board, which City Council unanimously approved. The Music Board reports to and provides music industry recommendations to the Music Officer.`
}
