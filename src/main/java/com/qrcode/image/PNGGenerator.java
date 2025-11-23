package main.java.com.qrcode.image;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.List;
import javax.imageio.ImageIO;
import main.java.com.qrcode.matrix.QRMatrix;

public class PNGGenerator {
 

    private final static int MATRIX_SIZE = 21; //size of version 1 qr code
    private final static int QUIET_ZONE = 4; //white border around the qr
    
    public static void generatePNG(QRMatrix matrix, String filename, int moduleSize) throws IOException 
    {
    
        int imageSize = (MATRIX_SIZE + (2 * QUIET_ZONE)) * moduleSize;

        int offset = QUIET_ZONE * moduleSize;

        BufferedImage image = new BufferedImage(imageSize, imageSize, BufferedImage.TYPE_INT_RGB);

        Graphics2D graphics = image.createGraphics();

        graphics.setColor(Color.white); //make background white
        graphics.fillRect(0, 0, imageSize, imageSize);

        graphics.setColor(Color.black); //drawing black squares
        for (int row = 0; row < MATRIX_SIZE; row++)
            for (int col = 0; col < MATRIX_SIZE; col++)
                if (matrix.getModule(row, col) == true)
                    graphics.fillRect(col * moduleSize + offset, row * moduleSize + offset, moduleSize, moduleSize);
            
        graphics.dispose();

        ImageIO.write(image, "PNG", new File(filename)); //save PNG

    }

    public static void main(String[] args) throws IOException 
    {
        System.out.println("Generating QR code PNG...");
        
        // Create QR matrix with data
        QRMatrix matrix = new QRMatrix();
        List<Boolean> dataBits = main.java.com.qrcode.encoder.DataEncoder.encodeUrl("hi");
        main.java.com.qrcode.matrix.ModulePlacer.placeData(matrix, dataBits);
        
        // Generate PNG (each module = 10x10 pixels)
        generatePNG(matrix, "qrcode.png", 10);
        
        System.out.println("QR code saved as qrcode.png!");
        System.out.println("Try scanning it with your phone!");
    }
    
}
