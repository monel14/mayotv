#!/usr/bin/env tsx

import { Command } from 'commander'
import { Collection, File } from '@freearhey/core'
import { WebInterfaceGenerator } from '../generators'

interface GenerateOptions {
  verbose?: boolean
}

const program = new Command()

program
  .name('web-interface:generate')
  .description('Génère l\'interface web MAYO TV')
  .option('-v, --verbose', 'Mode verbeux')
  .action(async (options: GenerateOptions) => {
    try {
      console.log('🚀 Génération de l\'interface web MAYO TV...')
      
      if (options.verbose) {
        console.log('📁 Préparation des répertoires...')
      }

      // Créer une collection vide de streams (pas besoin des données pour l'interface)
      const streams = new Collection()
      
      // Créer le fichier de log
      const logFile = new File('web-interface-generate.log')
      logFile.clear()

      if (options.verbose) {
        console.log('🔧 Initialisation du générateur...')
      }

      // Créer et exécuter le générateur
      const generator = new WebInterfaceGenerator({ streams, logFile })
      await generator.generate()

      console.log('✅ Interface web générée avec succès!')
      console.log('📍 Emplacement: .gh-pages/web-interface/')
      console.log('🌐 Accessible via: https://iptv-org.github.io/iptv/web-interface/')
      
      if (options.verbose) {
        console.log('📋 Vérifiez le fichier de log pour plus de détails: web-interface-generate.log')
      }

    } catch (error) {
      console.error('❌ Erreur lors de la génération de l\'interface web:', error.message)
      if (options.verbose) {
        console.error(error.stack)
      }
      process.exit(1)
    }
  })

program.parse()