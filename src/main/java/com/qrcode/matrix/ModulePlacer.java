package main.java.com.qrcode.matrix;

import java.util.List;
import main.java.com.qrcode.encoder.DataEncoder;

public class ModulePlacer {
    
    public static void placeData(QRMatrix matrix, List<Boolean> dataBits) {
        int bitIndex = 0;
        int col = 20; //start bottom right
        int row = 20;
        boolean movingUp = true;

        
        while (col >= 0 && bitIndex < dataBits.size()) 
        {

            if (col == 6) col--; //skip col 6
        
            if (!matrix.isFunctionModule(row, col)) //check if this square is a function module
            {
                matrix.update(row, col, dataBits.get(bitIndex));
                bitIndex++;
            }


            if (col % 2 == 0) col--; //move left one col

            else
            {
                col++; //move right one col

                if (movingUp) //move up
                {
                    row--;
    
                    if (row == -1) //hit the top
                    {
                        col -= 2;
                        row++;

                        movingUp = !movingUp;
                    }
                }

                else //move down
                {
                    row++;
    
                    if (row == 21) //hit the bottom
                    {
                        col -= 2;
                        row--;

                        movingUp = !movingUp;
                    }
                }

            }

            

        }
    }
    
    public static void main(String[] args) 
    {
        System.out.println("Testing ModulePlacer...");
        
        QRMatrix matrix = new QRMatrix();
        System.out.println("Original matrix:");
        System.out.println(matrix.toString());
        
        List<Boolean> dataBits = DataEncoder.encodeUrl("hi");
        System.out.println("Data bits to place: " + dataBits.size());
        
        placeData(matrix, dataBits);
        
        System.out.println("Matrix after placing data:");
        System.out.println(matrix.toString());
    }
}